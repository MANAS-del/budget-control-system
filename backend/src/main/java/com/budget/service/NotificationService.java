package com.budget.service;

import com.budget.entity.Notification;
import com.budget.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void createNotification(String targetUserId, String message, String type) {
        Notification notification = new Notification();
        notification.setTargetUserId(targetUserId);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForAdmin(String adminUserId) {
        return notificationRepository.findByTargetUserIdOrderByCreatedAtDesc(adminUserId);
    }

    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }
}
