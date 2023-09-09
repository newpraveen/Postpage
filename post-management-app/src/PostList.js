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

  const loadInitialSearchTerm = () => {
    const searchTerm = localStorage.getItem('searchTerm');
    return searchTerm || '';
  };

  const [searchTerm, setSearchTerm] = useState(loadInitialSearchTerm());

  const handleRefreshState = () => {
    setSearchQuery('');
    setRefreshState(!refreshState);
    localStorage.removeItem('searchQuery');
    setSearchTerm('');
  };

  const handleDeletePost = (postId) => {
    const updatedPosts = posts.filter((post) => post.id !== postId);
    setPosts(updatedPosts);
    handleRemoveFromDeleteQueue(postId);
  };

  const handleAddToDeleteQueue = (postId) => {
    setDeleteQueue([...deleteQueue, postId]);
    setDeleteQueueCount(deleteQueue.length + 1);
  };

  const handleRemoveFromDeleteQueue = (postId) => {
    const updatedDeleteQueue = deleteQueue.filter((id) => id !== postId);
    setDeleteQueue(updatedDeleteQueue);
    setDeleteQueueCount(updatedDeleteQueue.length);
  };

  const handleRefreshQueue = () => {
    deleteQueue.forEach((postId) => {
      console.log(`Deleted post with ID ${postId}`);
    });

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
    const filtered = posts.filter((post) => {
      return (
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.body.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    setFilteredPosts(filtered);

    localStorage.setItem('searchQuery', searchQuery);
    localStorage.setItem('searchTerm', searchTerm);
  }, [searchQuery, searchTerm, posts]);

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
