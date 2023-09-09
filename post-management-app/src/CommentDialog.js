import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
} from '@mui/material';

function CommentDialog({ open, onClose, comments, post }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Comments for Post: {post?.title}</DialogTitle>
      <DialogContent>
        {comments.map((comment) => (
          <div key={comment.id}>
            <Typography variant="subtitle1">{comment.name}</Typography>
            <Typography variant="body2">{comment.body}</Typography>
          </div>
        ))}
        <Button onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
}

export default CommentDialog;
