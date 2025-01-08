function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;

    // Append to notifications container
    const notificationsContainer = document.getElementById('notifications');
    notificationsContainer.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => notification.remove(), 3000);
}