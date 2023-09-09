import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography } from '@mui/material';
import DeleteButton from './DeleteButton';
import CommentDialog from './CommentDialog'; // Make sure the path is correct

function PostList() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null); // Define selectedPost state
  const [comments, setComments] = useState([]); // Define comments state
  const [openDialog, setOpenDialog] = useState(false); // Define openDialog state
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [refreshState, setRefreshState] = useState(false);
  const [deleteQueue, setDeleteQueue] = useState([]);
  const [deleteQueueCount, setDeleteQueueCount] = useState(0);

  const loadInitialSearchTerm = () => {
    const searchTerm = localStorage.getItem('searchTerm');
    return searchTerm || '';
  };
  const [searchTerm] = useState(loadInitialSearchTerm());

  // Define the missing functions
  const handleRefreshState = () => {
    setRefreshState(true);
    setFilteredPosts([]);
    setSearchQuery('');
    localStorage.removeItem('searchQuery');
  };

  const handleDeletePost = (postId) => {
    // Create a new array of posts excluding the deleted post
    const updatedPosts = posts.filter((post) => post.id !== postId);
    setPosts(updatedPosts);
  };

  const handleAddToDeleteQueue = (postId) => {
    // Add the postId to the deleteQueue
    setDeleteQueue([...deleteQueue, postId]);
    setDeleteQueueCount(deleteQueue.length + 1);
  };

  const handleRemoveFromDeleteQueue = (postId) => {
    // Remove the postId from the deleteQueue
    const updatedDeleteQueue = deleteQueue.filter((id) => id !== postId);
    setDeleteQueue(updatedDeleteQueue);
    setDeleteQueueCount(updatedDeleteQueue.length);
  };

  const handleRefreshQueue = () => {
    deleteQueue.forEach((postId) => {
      console.log(`Deleted post with ID ${postId}`);
    });

    // Clear the delete queue
    setDeleteQueue([]);
    setDeleteQueueCount(0);
  };

  useEffect(() => {
    if (refreshState) {
      axios
        .get('https://jsonplaceholder.typicode.com/posts')
        .then((response) => {
          setPosts(response.data);
          setRefreshState(false);
        })
        .catch((error) => {
          console.error('Error fetching posts:', error);
        });
    }
  }, [refreshState]);

  useEffect(() => {
    if (!refreshState) {
      axios
        .get('https://jsonplaceholder.typicode.com/posts')
        .then((response) => {
          setPosts(response.data);
        })
        .catch((error) => {
          console.error('Error fetching posts:', error);
        });
    }

    const storedSearchQuery = localStorage.getItem('searchQuery');
    if (storedSearchQuery) {
      setSearchQuery(storedSearchQuery);
    }
  }, [refreshState]);

  useEffect(() => {
    // Filter posts based on the search query
    const filtered = posts.filter((post) => {
      return (
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.body.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    setFilteredPosts(filtered);

    // Save search query to local storage
    localStorage.setItem('searchQuery', searchQuery);
  }, [searchQuery, posts]);

  useEffect(() => {
    localStorage.setItem('searchTerm', searchTerm);
  }, [searchTerm]);

  // Define the function to open the dialog
  const handlePostClick = (post) => {
    setSelectedPost(post);
    // Fetch comments when a post is clicked
    axios
      .get(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`)
      .then((response) => {
        setComments(response.data);
        setOpenDialog(true); // Open the dialog
      })
      .catch((error) => {
        console.error('Error fetching comments:', error);
      });
  };

  // Rest of your code remains the same

  return (
    <div className="post-list">
      <div>
        <input
          type="text"
          placeholder="Search Posts"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleRefreshState}>Refresh State</button>
      </div>
      {filteredPosts.slice(0, 15).map((post) => (
        <Card key={post.id}>
          <CardContent>
            <Typography variant="h5">{post.title}</Typography>
            <Typography variant="body2">{post.body}</Typography>
          </CardContent>
          <DeleteButton
            onClick={() => {
              handleDeletePost(post.id);
              handleAddToDeleteQueue(post.id);
            }}
          />
          <div>
            <button onClick={() => handlePostClick(post)}>View Comments</button>
            {deleteQueue.includes(post.id) && (
              <button onClick={() => handleRemoveFromDeleteQueue(post.id)}>Remove from Queue</button>
            )}
          </div>
          {selectedPost && post.id === selectedPost.id && ( // Add this condition
      <CommentDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        comments={comments}
        post={selectedPost}
      />
    )}
        </Card>
      ))}

      {deleteQueueCount > 0 && (
        <div>
          <button onClick={handleRefreshQueue}>Process Delete Queue</button>
          <p>Delete Queue Count: {deleteQueueCount}</p>
        </div>
      )}

      {selectedPost && (
        <CommentDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          comments={comments}
          post={selectedPost}
        />
      )}
    </div>
  );
}

export default PostList;
