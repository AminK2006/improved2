// Message data - starts with sample messages
let messages = [
    {
        text: "Hey! How's it going?",
        time: "2:30 PM",
        type: "received"
    },
    {
        text: "Pretty good, thanks for asking!",
        time: "2:31 PM",
        type: "sent"
    },
    {
        text: "What are you up to today?",
        time: "2:32 PM",
        type: "received"
    },
    {
        text: "Just working on some projects. You?",
        time: "2:33 PM",
        type: "sent"
    }
];

// App configuration
let config = {
    contactName: "Contact",
    notificationCount: 0
};

// Global variables for interaction handling
let currentEditIndex = -1;
let touchStartX = 0;
let touchStartY = 0;
let isScrolling = false;
let currentMessageEl = null;
let longPressTimer;
let isConfigMode = false;
let tapCount = 0;
let tapTimer = null;

/**
 * Toggle checkbox state
 */
function toggleCheckbox(id) {
    const checkbox = document.getElementById(id);
    checkbox.classList.toggle('checked');
}

/**
 * Update contact information and notification badge
 */
function updateContactInfo() {
    document.getElementById('contactName').textContent = config.contactName;
    const notificationEl = document.getElementById('notificationCount');
    notificationEl.textContent = config.notificationCount;
    
    // Hide notification badge if count is 0
    if (config.notificationCount === 0) {
        notificationEl.style.display = 'none';
    } else {
        notificationEl.style.display = 'inline-block';
    }
}

/**
 * Render all messages to the DOM
 */
function renderMessages() {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';

    messages.forEach((message, index) => {
        if (message.type === 'date') {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'date-separator';
            dateDiv.textContent = message.text;
            container.appendChild(dateDiv);
            return;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        
        // Create message bubble
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.textContent = message.text;
        
        // Add heart reaction if present
        if (message.hasHeart) {
            const heartDiv = document.createElement('div');
            heartDiv.className = 'heart-reaction';
            heartDiv.textContent = '💙';
            bubbleDiv.appendChild(heartDiv);
        }
        
        // Create timestamp
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'timestamp';
        timestampDiv.textContent = message.time;
        
        messageDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(timestampDiv);

        // Add touch event listeners for swipe gestures
        messageDiv.addEventListener('touchstart', handleTouchStart, { passive: false });
        messageDiv.addEventListener('touchmove', handleTouchMove, { passive: false });
        messageDiv.addEventListener('touchend', handleTouchEnd, { passive: true });

        container.appendChild(messageDiv);
    });

    // Auto-scroll to bottom
    scrollToBottom();
}

/**
 * Handle touch start for swipe gestures
 */
function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isScrolling = false;
    currentMessageEl = e.currentTarget;
}

/**
 * Handle touch move for swipe gestures
 */
function handleTouchMove(e) {
    if (!touchStartX || !touchStartY) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const diffX = touchStartX - touchX;
    const diffY = touchStartY - touchY;

    // Detect if this is a vertical scroll
    if (Math.abs(diffY) > Math.abs(diffX)) {
        isScrolling = true;
        return;
    }

    // Prevent horizontal scrolling during swipe
    if (Math.abs(diffX) > 10) {
        e.preventDefault();
    }

    // Show timestamp on horizontal swipe
    if (Math.abs(diffX) > 30 && !isScrolling && currentMessageEl) {
        currentMessageEl.classList.add('show-timestamp');
        
        if (currentMessageEl.classList.contains('sent')) {
            currentMessageEl.classList.add('shifted-left');
        } else {
            currentMessageEl.classList.add('shifted-right');
        }
    }
}

/**
 * Handle touch end for swipe gestures
 */
function handleTouchEnd(e) {
    if (currentMessageEl) {
        // Auto-hide timestamp after 2.5 seconds
        setTimeout(() => {
            currentMessageEl.classList.remove('show-timestamp', 'shifted-left', 'shifted-right');
        }, 2500);
    }

    // Reset touch tracking
    touchStartX = 0;
    touchStartY = 0;
    isScrolling = false;
    currentMessageEl = null;
}

/**
 * Show edit panel for adding new messages
 */
function showEditPanel() {
    isConfigMode = false;
    showMessageMode();
    currentEditIndex = -1;
    
    // Reset form
    document.getElementById('messageText').value = '';
    document.getElementById('messageTime').value = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric', 
        minute: '2-digit'
    });
    document.getElementById('messageSender').value = 'sent';
    document.getElementById('heartReaction').classList.remove('checked');
    document.getElementById('showDate').classList.remove('checked');
    document.getElementById('deleteBtn').style.display = 'none';
    
    // Show panel
    document.getElementById('editPanel').classList.add('show');
}

/**
 * Show configuration mode
 */
function showConfigMode() {
    isConfigMode = true;
    document.getElementById('panelTitle').textContent = 'Settings';
    document.getElementById('configContactName').value = config.contactName;
    document.getElementById('configNotificationCount').value = config.notificationCount;
    
    // Show config fields, hide message fields
    document.getElementById('configSection').style.display = 'flex';
    document.getElementById('configSection2').style.display = 'flex';
    document.getElementById('messageSection').style.display = 'none';
    document.getElementById('messageSection2').style.display = 'none';
    document.getElementById('messageSection3').style.display = 'none';
    document.getElementById('messageSection4').style.display = 'none';
    document.getElementById('messageSection5').style.display = 'none';
    document.getElementById('configBtn').style.display = 'none';
    document.getElementById('deleteBtn').style.display = 'none';
    document.getElementById('saveBtn').textContent = 'Save Settings';
}

/**
 * Show message editing mode
 */
function showMessageMode() {
    isConfigMode = false;
    document.getElementById('panelTitle').textContent = currentEditIndex >= 0 ? 'Edit Message' : 'Add Message';
    
    // Show message fields, hide config fields
    document.getElementById('configSection').style.display = 'none';
    document.getElementById('configSection2').style.display = 'none';
    document.getElementById('messageSection').style.display = 'flex';
    document.getElementById('messageSection2').style.display = 'flex';
    document.getElementById('messageSection3').style.display = 'flex';
    document.getElementById('messageSection4').style.display = 'flex';
    document.getElementById('messageSection5').style.display = 'flex';
    document.getElementById('configBtn').style.display = 'inline-block';
    document.getElementById('saveBtn').textContent = 'Save';
}

/**
 * Hide edit panel
 */
function hideEditPanel() {
    document.getElementById('editPanel').classList.remove('show');
}

/**
 * Edit existing message
 */
function editMessage(index) {
    const message = messages[index];
    if (message.type === 'date') return;

    currentEditIndex = index;
    showMessageMode();
    
    // Populate form with message data
    document.getElementById('messageText').value = message.text;
    document.getElementById('messageTime').value = message.time;
    document.getElementById('messageSender').value = message.type;
    
    if (message.hasHeart) {
        document.getElementById('heartReaction').classList.add('checked');
    } else {
        document.getElementById('heartReaction').classList.remove('checked');
    }
    
    document.getElementById('showDate').classList.remove('checked');
    document.getElementById('deleteBtn').style.display = 'block';
    document.getElementById('editPanel').classList.add('show');
}

/**
 * Delete current message
 */
function deleteMessage() {
    if (currentEditIndex >= 0) {
        messages.splice(currentEditIndex, 1);
        renderMessages();
        hideEditPanel();
    }
}

/**
 * Scroll to bottom of messages
 */
function scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

/**
 * Export messages as JSON
 */
function exportMessages() {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'imessage-conversation.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set up initial state
    updateContactInfo();
    renderMessages();

    // Triple tap detection for showing edit panel
    document.addEventListener('touchend', function(e) {
        tapCount++;
        
        if (tapCount === 1) {
            tapTimer = setTimeout(() => {
                tapCount = 0;
            }, 500);
        } else if (tapCount === 3) {
            clearTimeout(tapTimer);
            tapCount = 0;
            showEditPanel();
            e.preventDefault();
        }
    });

    // Prevent context menu on long press
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // Handle form submission
    document.getElementById('editForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (isConfigMode) {
            // Save configuration
            config.contactName = document.getElementById('configContactName').value.trim() || 'Contact';
            config.notificationCount = parseInt(document.getElementById('configNotificationCount').value) || 0;
            updateContactInfo();
            hideEditPanel();
            return;
        }
        
        // Save message
        const text = document.getElementById('messageText').value.trim();
        const time = document.getElementById('messageTime').value.trim();
        const type = document.getElementById('messageSender').value;
        const hasHeart = document.getElementById('heartReaction').classList.contains('checked');
        const showDate = document.getElementById('showDate').classList.contains('checked');

        if (!text) return;

        const messageData = { 
            text, 
            time, 
            type, 
            hasHeart: hasHeart || undefined
        };

        if (showDate) {
            if (currentEditIndex >= 0) {
                messages.splice(currentEditIndex, 1, { text: time, type: 'date' }, messageData);
            } else {
                messages.push({ text: time, type: 'date' }, messageData);
            }
        } else {
            if (currentEditIndex >= 0) {
                messages[currentEditIndex] = messageData;
            } else {
                messages.push(messageData);
            }
        }

        renderMessages();
        hideEditPanel();
    });

    // Prevent zoom on touch interactions
    document.addEventListener('touchmove', function(e) {
        if (e.scale !== 1) { 
            e.preventDefault(); 
        }
    }, { passive: false });

    // Long press to edit messages
    document.addEventListener('touchstart', function(e) {
        if (e.target.closest('.message-bubble')) {
            longPressTimer = setTimeout(() => {
                const messageEl = e.target.closest('.message');
                const allMessages = Array.from(document.querySelectorAll('.message'));
                const index = allMessages.indexOf(messageEl);
                
                // Filter out date separators to get correct message index
                let messageIndex = 0;
                for (let i = 0; i < messages.length; i++) {
                    if (messages[i].type !== 'date') {
                        if (messageIndex === index) {
                            editMessage(i);
                            break;
                        }
                        messageIndex++;
                    }
                }
            }, 500);
        }
    });

    // Clear long press timer on touch end/move
    document.addEventListener('touchend', function() {
        clearTimeout(longPressTimer);
    });

    document.addEventListener('touchmove', function() {
        clearTimeout(longPressTimer);
    });

    // Keyboard shortcut for export (Ctrl/Cmd + E)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportMessages();
        }
    });

    // Handle window resize for mobile orientation changes
    window.addEventListener('resize', function() {
        setTimeout(scrollToBottom, 100);
    });
});