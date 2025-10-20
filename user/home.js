// home.js - TIMELINE FUNCTIONALITY

document.addEventListener('DOMContentLoaded', () => {
  initializeHome();
});

function initializeHome() {
  loadTimeline();
  setupEventListeners();
}

// Sample data for demo
let posts = JSON.parse(localStorage.getItem('neuroreads_posts')) || [
  {
    id: 1,
    userId: "booklover123",
    userName: "Sarah Johnson",
    userAvatar: "../icons/top-user.png",
    content: "Just finished 'The Midnight Library' and wow, what an incredible journey! The concept of exploring different lives really makes you appreciate the choices you've made. Highly recommend! 📚✨",
    timestamp: "2 hours ago",
    likes: 24,
    comments: [
      {
        id: 1,
        userId: "reader456",
        userName: "Mike Chen",
        userAvatar: "../icons/top-user.png",
        content: "Completely agree! That book stayed with me for days.",
        timestamp: "1 hour ago"
      }
    ],
    liked: false
  },
  {
    id: 2,
    userId: "literature_fan",
    userName: "Alex Rivera",
    userAvatar: "../icons/top-user.png",
    content: "Starting my journey through 'War and Peace' today. Any tips for tackling this classic? 🤔",
    book: {
      title: "War and Peace",
      author: "Leo Tolstoy",
      cover: "../images/bookCover/war_and_peace.jpg"
    },
    timestamp: "5 hours ago",
    likes: 15,
    comments: [
      {
        id: 2,
        userId: "classic_reader",
        userName: "Emma Wilson",
        userAvatar: "../icons/top-user.png",
        content: "Take your time with it and maybe keep a character list handy!",
        timestamp: "3 hours ago"
      },
      {
        id: 3,
        userId: "bookworm99",
        userName: "David Kim",
        userAvatar: "../icons/top-user.png",
        content: "The payoff is worth it! One of my all-time favorites.",
        timestamp: "2 hours ago"
      }
    ],
    liked: true
  }
];

function loadTimeline() {
  const timeline = document.getElementById('timeline');
  
  if (posts.length === 0) {
    timeline.innerHTML = `
      <div class="card post-card">
        <div class="card-body text-center py-5">
          <h5>No posts yet</h5>
          <p class="text-muted">Be the first to share what you're reading!</p>
        </div>
      </div>
    `;
    return;
  }

  timeline.innerHTML = posts.map(post => createPostCard(post)).join('');
}

function createPostCard(post) {
  const bookSection = post.book ? `
    <div class="post-book">
      <h6>${post.book.title}</h6>
      <p>By ${post.book.author}</p>
    </div>
  ` : '';

  const commentsHtml = post.comments.map(comment => `
    <div class="comment">
      <img src="${comment.userAvatar}" alt="${comment.userName}" class="comment-avatar">
      <div class="comment-content">
        <div class="comment-header">
          <h6>${comment.userName}</h6>
          <span class="comment-time">${comment.timestamp}</span>
        </div>
        <div class="comment-text">${comment.content}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="card post-card" data-post-id="${post.id}">
      <div class="card-body">
        <!-- Post Header -->
        <div class="post-header">
          <img src="${post.userAvatar}" alt="${post.userName}" class="user-avatar-sm">
          <div class="post-user-info">
            <h6>${post.userName}</h6>
            <span class="post-time">${post.timestamp}</span>
          </div>
        </div>

        <!-- Post Content -->
        <div class="post-content">${post.content}</div>
        
        <!-- Book Info (if any) -->
        ${bookSection}

        <!-- Post Actions -->
        <div class="post-actions-bottom">
          <button class="post-action like-btn ${post.liked ? 'active' : ''}" data-post-id="${post.id}">
            <span>❤️</span>
            <span>${post.likes}</span>
          </button>
          <button class="post-action comment-btn" data-post-id="${post.id}">
            <span>💬</span>
            <span>${post.comments.length}</span>
          </button>
          <button class="post-action share-btn">
            <span>🔄</span>
            <span>Share</span>
          </button>
        </div>

        <!-- Comments Section -->
        <div class="comments-section">
          ${commentsHtml}
          <div class="add-comment">
            <img src="../icons/top-user.png" alt="You" class="comment-avatar">
            <input type="text" class="form-control comment-input" placeholder="Write a comment..." data-post-id="${post.id}">
          </div>
        </div>
      </div>
    </div>
  `;
}

function setupEventListeners() {
  // Post button
  const postBtn = document.getElementById('postBtn');
  const postInput = document.querySelector('.post-input');
  
  postBtn.addEventListener('click', createPost);
  postInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      createPost();
    }
  });

  // Like buttons
  document.addEventListener('click', (e) => {
    if (e.target.closest('.like-btn')) {
      const likeBtn = e.target.closest('.like-btn');
      const postId = parseInt(likeBtn.getAttribute('data-post-id'));
      toggleLike(postId, likeBtn);
    }
  });

  // Comment submission
  document.addEventListener('keypress', (e) => {
    if (e.target.classList.contains('comment-input') && e.key === 'Enter') {
      const commentInput = e.target;
      const postId = parseInt(commentInput.getAttribute('data-post-id'));
      const content = commentInput.value.trim();
      
      if (content) {
        addComment(postId, content);
        commentInput.value = '';
      }
    }
  });
}

function createPost() {
  const postInput = document.querySelector('.post-input');
  const content = postInput.value.trim();
  
  if (!content) {
    showNotification('Please write something to post!', 'error');
    return;
  }

  const newPost = {
    id: Date.now(),
    userId: "current_user",
    userName: "You",
    userAvatar: "../icons/top-user.png",
    content: content,
    timestamp: "Just now",
    likes: 0,
    comments: [],
    liked: false
  };

  posts.unshift(newPost);
  savePosts();
  loadTimeline();
  postInput.value = '';
  showNotification('Post published successfully!', 'success');
}

function toggleLike(postId, likeBtn) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  if (post.liked) {
    post.likes--;
    post.liked = false;
    likeBtn.classList.remove('active');
  } else {
    post.likes++;
    post.liked = true;
    likeBtn.classList.add('active');
  }

  likeBtn.querySelector('span:last-child').textContent = post.likes;
  savePosts();
}

function addComment(postId, content) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const newComment = {
    id: Date.now(),
    userId: "current_user",
    userName: "You",
    userAvatar: "../icons/top-user.png",
    content: content,
    timestamp: "Just now"
  };

  post.comments.push(newComment);
  savePosts();
  loadTimeline();
  showNotification('Comment added!', 'success');
}

function savePosts() {
  localStorage.setItem('neuroreads_posts', JSON.stringify(posts));
}

function showNotification(message, type = 'info') {
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
  } else {
    // Fallback notification
    const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-danger' : 'alert-info';
    const alert = document.createElement('div');
    alert.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
    alert.style.cssText = `
      top: 20px;
      right: 20px;
      z-index: 10000;
      min-width: 300px;
    `;
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    
    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }
    }, 3000);
  }
}

// Load friend activities
function loadFriendActivities() {
  const friendsList = document.querySelector('.friends-list');
  const activities = [
    {
      user: "Emma Wilson",
      action: "started reading 'The Great Gatsby'",
      time: "30 min ago"
    },
    {
      user: "Mike Chen",
      action: "finished 'Project Hail Mary'",
      time: "2 hours ago"
    },
    {
      user: "Alex Rivera",
      action: "added 5 books to wishlist",
      time: "4 hours ago"
    }
  ];

  friendsList.innerHTML = activities.map(activity => `
    <div class="friend-activity">
      <img src="../icons/top-user.png" alt="${activity.user}" class="friend-activity-avatar">
      <div>
        <div class="friend-activity-text">
          <strong>${activity.user}</strong> ${activity.action}
        </div>
        <div class="friend-activity-time">${activity.time}</div>
      </div>
    </div>
  `).join('');
}

// Initialize friend activities
loadFriendActivities();