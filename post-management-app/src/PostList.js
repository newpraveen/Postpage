import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography } from '@mui/material';
import DeleteButton from './DeleteButton';
import CommentDialog from './CommentDialog';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [refreshState, setRefreshState] = useState(false);
  const [deleteQueue, setDeleteQueue] = useState([]);
  const [deleteQueueCount, setDeleteQueueCount] = useState(0);

  useEffect(() => {
    // Load posts from the API on initial component mount
    axios
      .get('https://jsonplaceholder.typicode.com/posts')
      .then((response) => {
        setPosts(response.data);
      })
      .catch((error) => {
        console.error('Error fetching posts:', error);
      });

    // Load delete queue from state

    // Load search query from URL parameter
    const urlSearchParams = new URLSearchParams(window.location.search);
    const savedSearchQuery = urlSearchParams.get('searchQuery') || '';
    setSearchQuery(savedSearchQuery);
  }, []);

  const updateURL = (query) => {
    const urlSearchParams = new URLSearchParams();
    if (query) {
      urlSearchParams.set('searchQuery', query);
    } else {
      urlSearchParams.delete('searchQuery');
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${urlSearchParams.toString()}`);
  };

  const urlSearchParams = new URLSearchParams(window.location.search);
    const savedDeleteQueue = urlSearchParams.get('deleteQueue');
    if (savedDeleteQueue) {
      setDeleteQueue(savedDeleteQueue.split(',').map(Number));
      setDeleteQueueCount(savedDeleteQueue.split(',').length);
    }

  const handleRefreshState = () => {
    setSearchQuery('');
    setRefreshState(!refreshState);
  };

  const handleDeletePost = (postId) => {
    // Add the postId to the delete queue
    const updatedDeleteQueue = [...deleteQueue, postId];
    setDeleteQueue(updatedDeleteQueue);
    setDeleteQueueCount(updatedDeleteQueue.length);

    // Remove the post from the filteredPosts
    setFilteredPosts(filteredPosts.filter((post) => post.id !== postId));

    // Update URL with the current deleteQueue
    updateURL(searchQuery, updatedDeleteQueue);
  };


  const handleRefreshQueue = () => {
    deleteQueue.forEach((postId) => {
      // Send DELETE API request here to delete the post
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
    const filtered = posts.filter((post) => {
      return (
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.body.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    setFilteredPosts(filtered);

    // Update URL with the current search query
    updateURL(searchQuery);
  }, [searchQuery, posts]);

  const handlePostClick = (post) => {
    setSelectedPost(post);
    axios
      .get(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`)
      .then((response) => {
        setComments(response.data);
        setOpenDialog(true);
      })
      .catch((error) => {
        console.error('Error fetching comments:', error);
      });
  };

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
          <DeleteButton onClick={() => handleDeletePost(post.id)} />
          <div>
            <button onClick={() => handlePostClick(post)}>View Comments</button>
          </div>
          {selectedPost && post.id === selectedPost.id && (
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
    </div>
  );
}

export default PostList;
