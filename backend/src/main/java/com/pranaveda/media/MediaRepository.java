package com.pranaveda.media;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaRepository extends JpaRepository<MediaAsset, Long> {

    Optional<MediaAsset> findByIdAndOwnerId(Long id, Long ownerId);

    /** All media of a kind linked to a content item (featured images + step images). */
    List<MediaAsset> findByContentIdAndKind(Long contentId, MediaKind kind);
}
