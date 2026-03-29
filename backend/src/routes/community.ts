import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get social feed for an expedition
router.get('/:expeditionId/feed', authenticateToken, async (req, res) => {
  try {
    const expeditionId = req.params.expeditionId as string;

    // Verify user is part of this expedition (trekker or leader)
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    let yieldsAccess = false;
    if (userRole === 'ADMIN') {
      yieldsAccess = true;
    } else {
       const booking = await prisma.booking.findFirst({
        where: {
          expeditionId,
          userId,
          status: 'CONFIRMED'
        }
      });
      if (booking) yieldsAccess = true;

      // Also check if user is the guide for the trek of this expedition
      const expedition = await prisma.expedition.findUnique({
        where: { id: expeditionId },
        include: { trek: true }
      });
      if (expedition && (expedition as any).trek?.guideId === userId) yieldsAccess = true;
    }

    if (!yieldsAccess) {
      return res.status(403).json({ error: 'Access denied to this expedition feed' });
    }

    const posts = await prisma.expeditionPost.findMany({
      where: { expeditionId },
      include: {
        user: {
          select: {
            name: true,
            profileImage: true,
            role: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                name: true,
                profileImage: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// Create a post in the feed
router.post('/:expeditionId/feed', authenticateToken, async (req, res) => {
  try {
    const expeditionId = req.params.expeditionId as string;
    const { content, type, mediaUrl } = req.body;
    const userId = (req as any).user.id;

    // Verify access
    const booking = await prisma.booking.findFirst({
      where: {
        expeditionId,
        userId,
        status: 'CONFIRMED'
      }
    });

    if (!booking && (req as any).user.role !== 'ADMIN') {
       const expedition = await prisma.expedition.findUnique({
        where: { id: expeditionId },
        include: { trek: true }
      });
      if (!expedition || (expedition as any).trek?.guideId !== userId) {
         return res.status(403).json({ error: 'Only confirmed participants can post' });
      }
    }

    const post = await prisma.expeditionPost.create({
      data: {
        expeditionId,
        userId,
        content,
        type: type || 'MESSAGE',
        mediaUrl
      },
      include: {
        user: {
          select: {
            name: true,
            profileImage: true
          }
        }
      }
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Add a comment to a post
router.post('/:expeditionId/feed/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const expeditionId = req.params.expeditionId as string;
    const postId = req.params.postId as string;
    const { content } = req.body;
    const userId = (req as any).user.id;

    // Verify post belongs to this expedition
    const post = await prisma.expeditionPost.findFirst({
      where: { id: postId, expeditionId }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found in this expedition' });
    }

    const comment = await prisma.postComment.create({
      data: {
        postId,
        userId,
        content
      },
      include: {
        user: {
          select: {
            name: true,
            profileImage: true
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Get participant roster for an expedition
router.get('/:expeditionId/roster', authenticateToken, async (req, res) => {
  try {
    const expeditionId = req.params.expeditionId as string;

    const confirmedBookings = await prisma.booking.findMany({
      where: {
        expeditionId,
        status: 'CONFIRMED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            country: true,
            bio: true,
            role: true
          }
        }
      }
    });

    const expedition = await prisma.expedition.findUnique({
      where: { id: expeditionId },
      include: {
        trek: {
          include: {
            guide: {
              select: {
                id: true,
                name: true,
                profileImage: true,
                role: true,
                bio: true
              }
            }
          }
        }
      }
    });

    const participants = confirmedBookings.map(b => (b as any).user);
    const guide = expedition && (expedition as any).trek?.guide;

    res.json({
      participants,
      leader: guide
    });
  } catch (error) {
    console.error('Error fetching roster:', error);
    res.status(500).json({ error: 'Failed to fetch roster' });
  }
});

export default router;
