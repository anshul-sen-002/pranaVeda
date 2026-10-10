package com.pranaveda.ai;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AiConversationRepository extends JpaRepository<AiConversation, Long> {

    /** Owner-scoped lookup - the only way conversations are ever resolved. */
    Optional<AiConversation> findByIdAndUserId(Long id, Long userId);

    List<AiConversation> findByUserIdOrderByUpdatedAtDesc(Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
