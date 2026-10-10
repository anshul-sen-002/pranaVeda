package com.pranaveda.media;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaRepository extends JpaRepository<MediaAsset, Long> {

    Optional<MediaAsset> findByIdAndOwnerId(Long id, Long ownerId);
}
