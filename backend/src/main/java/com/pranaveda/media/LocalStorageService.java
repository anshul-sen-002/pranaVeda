package com.pranaveda.media;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import javax.imageio.ImageIO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import com.pranaveda.common.error.StorageException;

/**
 * Local-disk {@link StorageService} for development. Stores files under the
 * configured {@code app.storage.upload-dir} directory and serves them through
 * the {@code /api/v1/media/serve/} endpoint.
 *
 * <p>Only active when {@code app.storage.provider=local}.
 */
@Service
@ConditionalOnProperty(name = "app.storage.provider", havingValue = "local")
public class LocalStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageService.class);

    private final Path root;

    public LocalStorageService(@Value("${app.storage.upload-dir:uploads}") String uploadDir) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.root);
        } catch (IOException ex) {
            throw new IllegalStateException("Cannot create local storage directory: " + this.root, ex);
        }
    }

    @Override
    public StoredMedia upload(byte[] bytes, String folder, String publicId, String resourceType) {
        return upload(bytes, folder, publicId, resourceType, null);
    }

    @Override
    public StoredMedia upload(byte[] bytes, String folder, String publicId, String resourceType,
                              java.util.List<java.util.Map<String, Object>> eager) {
        String scopedId = combine(folder, publicId);
        Path target = root.resolve(scopedId);
        try {
            Files.createDirectories(target.getParent());
            try (FileOutputStream out = new FileOutputStream(target.toFile())) {
                out.write(bytes);
            }

            String format = guessFormatFromBytes(bytes);
            Integer width = null;
            Integer height = null;
            Double durationSecs = null;

            if ("image".equals(resourceType)) {
                try (InputStream in = new ByteArrayInputStream(bytes)) {
                    BufferedImage img = ImageIO.read(in);
                    if (img != null) {
                        width = img.getWidth();
                        height = img.getHeight();
                    }
                } catch (IOException ex) {
                    log.warn("Could not read image dimensions for {}", scopedId, ex);
                }
            }

            String serveUrl = "/api/v1/media/serve/" + scopedId;

            return new StoredMedia(scopedId, serveUrl, resourceType, format, bytes.length, width, height, durationSecs);
        } catch (IOException ex) {
            throw new StorageException("Failed to store the uploaded file locally.", ex);
        }
    }

    @Override
    public void delete(String publicId, String resourceType) {
        try {
            Files.deleteIfExists(root.resolve(publicId));
        } catch (IOException ex) {
            log.warn("Local delete failed for publicId={} resourceType={}", publicId, resourceType, ex);
        }
    }

    /** Returns the local file path for a stored object (used by the serve endpoint). */
    public Path resolvePath(String publicId) {
        return root.resolve(publicId).normalize();
    }

    /** Returns the storage root directory (for path-traversal checks). */
    public Path getRoot() {
        return root;
    }

    private static String combine(String folder, String publicId) {
        if (folder == null || folder.isBlank()) {
            return publicId;
        }
        return folder.replaceAll("/+$", "") + "/" + publicId;
    }

    public static String guessFormatFromBytes(byte[] bytes) {
        if (bytes.length < 4) {
            return null;
        }
        // PNG signature
        if (bytes[0] == (byte) 0x89 && bytes[1] == 'P' && bytes[2] == 'N' && bytes[3] == 'G') {
            return "png";
        }
        // JPEG SOI
        if (bytes[0] == (byte) 0xFF && bytes[1] == (byte) 0xD8) {
            return "jpeg";
        }
        // GIF
        if (bytes.length >= 6 && bytes[0] == 'G' && bytes[1] == 'I' && bytes[2] == 'F') {
            return "gif";
        }
        // WEBP: RIFF....WEBP
        if (bytes.length >= 12 && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') {
            return "webp";
        }
        // AVIF: ftyp...avif
        if (bytes.length >= 12 && bytes[4] == 'f' && bytes[5] == 't' && bytes[6] == 'y' && bytes[7] == 'p'
                && bytes[8] == 'a' && bytes[9] == 'v' && bytes[10] == 'i' && bytes[11] == 'f') {
            return "avif";
        }
        // MP3: ID3 or FF FB
        if ((bytes[0] == 'I' && bytes[1] == 'D' && bytes[2] == '3')
                || (bytes[0] == (byte) 0xFF && (bytes[1] & 0xE0) == 0xE0)) {
            return "mp3";
        }
        // OGG: OggS
        if (bytes[0] == 'O' && bytes[1] == 'g' && bytes[2] == 'g' && bytes[3] == 'S') {
            return "ogg";
        }
        // WAV: RIFF....WAVE
        if (bytes.length >= 12 && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'A' && bytes[10] == 'V' && bytes[11] == 'E') {
            return "wav";
        }
        // MP4/M4A: ftyp...mp4 / ftyp...M4A
        if (bytes.length >= 12 && bytes[4] == 'f' && bytes[5] == 't' && bytes[6] == 'y' && bytes[7] == 'p') {
            String brand = new String(bytes, 8, 4);
            if ("mp42".equals(brand) || "mp41".equals(brand) || "isom".equals(brand)) {
                return "mp4";
            }
            if ("M4A ".equals(brand) || "M4B ".equals(brand)) {
                return "m4a";
            }
        }
        return "bin";
    }
}