export default class NotificationManager {
  constructor(scene) {
    this.scene = scene;
    this.activeNotifications = [];
    this.notificationQueue = [];
    this.maxVisibleNotifications = 3;
    this.notificationSpacing = 120;
  }

  showNotification(config) {
    const notification = {
      id: Date.now() + Math.random(),
      title: config.title || 'Notification',
      description: config.description || '',
      subtitle: config.subtitle || '',
      icon: config.icon || '📢',
      color: config.color || '#3b82f6',
      duration: config.duration || 4000,
      type: config.type || 'info',
      rewards: config.rewards || null
    };

    if (this.activeNotifications.length >= this.maxVisibleNotifications) {
      this.notificationQueue.push(notification);
    } else {
      this.displayNotification(notification);
    }
  }

  displayNotification(notification) {
    const yPos = 100 + (this.activeNotifications.length * this.notificationSpacing);

    // Create notification container
    const container = this.scene.add.container(1280, yPos)
      .setDepth(2000);

    // Background
    const bg = this.scene.add.rectangle(0, 0, 350, 100, 0x1e293b, 0.95)
      .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(notification.color).color);

    // Icon
    const icon = this.scene.add.text(-150, 0, notification.icon, {
      fontSize: '32px',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Title
    const title = this.scene.add.text(-110, -20, notification.title, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // Description
    const description = this.scene.add.text(-110, 5, notification.description, {
      fontSize: '13px',
      color: '#e2e8f0',
      fontFamily: 'Arial',
      wordWrap: { width: 220 }
    }).setOrigin(0, 0.5);

    // Subtitle
    let subtitle = null;
    if (notification.subtitle) {
      subtitle = this.scene.add.text(-110, 25, notification.subtitle, {
        fontSize: '11px',
        color: '#94a3b8',
        fontFamily: 'Arial',
        wordWrap: { width: 220 }
      }).setOrigin(0, 0.5);
    }

    // Rewards display
    let rewardText = null;
    if (notification.rewards) {
      const rewardStr = this.formatRewards(notification.rewards);
      rewardText = this.scene.add.text(-110, 40, `Rewards: ${rewardStr}`, {
        fontSize: '11px',
        color: '#10b981',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);
    }

    // Add elements to container
    const elements = [bg, icon, title, description];
    if (subtitle) elements.push(subtitle);
    if (rewardText) elements.push(rewardText);
    container.add(elements);

    // Slide in animation
    this.scene.tweens.add({
      targets: container,
      x: 930,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // Pulse effect based on type
    if (notification.type === 'achievement') {
      this.scene.tweens.add({
        targets: [icon],
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 300,
        yoyo: true,
        repeat: 2,
        ease: 'Sine.easeInOut'
      });
    }

    // Auto-dismiss after duration
    this.scene.time.delayedCall(notification.duration, () => {
      this.dismissNotification(notification, container);
    });

    // Store notification
    notification.container = container;
    this.activeNotifications.push(notification);
  }

  dismissNotification(notification, container) {
    // Slide out animation
    this.scene.tweens.add({
      targets: container,
      x: 1400,
      alpha: 0,
      duration: 300,
      ease: 'Back.easeIn',
      onComplete: () => {
        container.destroy();

        // Remove from active list
        this.activeNotifications = this.activeNotifications.filter(n => n.id !== notification.id);

        // Reposition remaining notifications
        this.repositionNotifications();

        // Show next queued notification
        if (this.notificationQueue.length > 0) {
          const next = this.notificationQueue.shift();
          this.displayNotification(next);
        }
      }
    });
  }

  repositionNotifications() {
    this.activeNotifications.forEach((notification, index) => {
      const targetY = 100 + (index * this.notificationSpacing);

      this.scene.tweens.add({
        targets: notification.container,
        y: targetY,
        duration: 300,
        ease: 'Sine.easeInOut'
      });
    });
  }

  formatRewards(rewards) {
    const parts = [];

    if (rewards.energy) {
      parts.push(`${rewards.energy} ⚡`);
    }
    if (rewards.altanerite) {
      parts.push(`${rewards.altanerite} 💎`);
    }
    if (rewards.homainionite) {
      parts.push(`${rewards.homainionite} 🔮`);
    }
    if (rewards.title) {
      parts.push(`Title: "${rewards.title}"`);
    }

    return parts.join(', ');
  }

  clearAll() {
    this.activeNotifications.forEach(notification => {
      notification.container?.destroy();
    });
    this.activeNotifications = [];
    this.notificationQueue = [];
  }

  destroy() {
    this.clearAll();
  }
}
