import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

/**
 * 📡 EXPEDITION TELEMETRY & ACCESS
 * Used by Trekkers and Leaders to fetch core trek state.
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const activeBooking = await prisma.expedition.findUnique({
      where: { id: req.params.id },
      include: {
        trek: {
          select: { title: true, maxAltitude: true, durationDays: true }
        },
        bookings: {
          where: {
            userId,
            status: 'CONFIRMED'
          }
        }
      }
    });

    if (!activeBooking) return res.status(404).json({ error: 'Mission details not found' });
    
    // Authorization check
    if (activeBooking.bookings.length === 0 && (req as any).user.role !== 'LEADER' && (req as any).user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access Denied: High-clearance only.' });
    }

    res.json(activeBooking);
  } catch (error: any) {
    res.status(500).json({ error: 'Mission telemetry failure' });
  }
});

/**
 * 💬 SOCIAL COMMAND (FEED)
 */
router.get('/:expeditionId/feed', async (req, res) => {
  try {
    const expeditionId = req.params.expeditionId as string;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    let yieldsAccess = false;
    if (userRole === 'ADMIN') {
      yieldsAccess = true;
    } else {
       const booking = await prisma.booking.findFirst({
        where: { expeditionId, userId, status: 'CONFIRMED' }
      });
      if (booking) yieldsAccess = true;

      const expedition = await prisma.expedition.findUnique({
        where: { id: expeditionId },
        include: { trek: true }
      });
      if (expedition && (expedition as any).trek?.guideId === userId) yieldsAccess = true;
    }

    if (!yieldsAccess) return res.status(403).json({ error: 'Access denied to mission feed' });

    const posts = await prisma.expeditionPost.findMany({
      where: { expeditionId },
      include: {
        user: { select: { name: true, profileImage: true, role: true } },
        comments: {
          include: { user: { select: { name: true, profileImage: true } } },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Feed access failed' });
  }
});

router.post('/:expeditionId/feed', async (req, res) => {
  try {
    const expeditionId = req.params.expeditionId as string;
    const { content, type, mediaUrl } = req.body;
    const userId = (req as any).user.id;

    // Verify access
    const booking = await prisma.booking.findFirst({
      where: { expeditionId, userId, status: 'CONFIRMED' }
    });

    if (!booking && (req as any).user.role !== 'ADMIN') {
       const expedition = await prisma.expedition.findUnique({
        where: { id: expeditionId },
        include: { trek: true }
      });
      if (!expedition || (expedition as any).trek?.guideId !== userId) {
         return res.status(403).json({ error: 'Unauthorized to post' });
      }
    }

    const post = await prisma.expeditionPost.create({
      data: { expeditionId, userId, content, type: type || 'MESSAGE', mediaUrl },
      include: { user: { select: { name: true, profileImage: true } } }
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Post failed' });
  }
});

router.post('/:expeditionId/feed/:postId/comments', async (req, res) => {
  try {
    const expeditionId = req.params.expeditionId as string;
    const postId = req.params.postId as string;
    const { content } = req.body;
    const userId = (req as any).user.id;

    const post = await prisma.expeditionPost.findFirst({
      where: { id: postId, expeditionId }
    });

    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = await prisma.postComment.create({
      data: { postId, userId, content },
      include: { user: { select: { name: true, profileImage: true } } }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Comment failed' });
  }
});

/**
 * 🎖️ MISSION ROSTER
 */
router.get('/:expeditionId/roster', async (req, res) => {
  try {
    const expeditionId = req.params.expeditionId as string;
    const user = (req as any).user;

    const confirmedBookings = await prisma.booking.findMany({
      where: { expeditionId, status: 'CONFIRMED' },
      include: {
        user: {
          select: {
            id: true, name: true, profileImage: true, country: true, 
            bio: true, role: true, medicalProfile: { select: { status: true, updatedAt: true } }
          }
        }
      }
    });

    const expedition = await prisma.expedition.findUnique({
      where: { id: expeditionId },
      include: { trek: { include: { guide: { select: { id: true, name: true, profileImage: true, role: true, bio: true } } } } }
    });

    const isAuthorizedLeader = (user.role === 'LEADER' && expedition?.trek?.guideId === user.id) || user.role === 'ADMIN';

    const participants = confirmedBookings.map(b => {
       const u = (b as any).user;
       if (!isAuthorizedLeader) delete u.medicalProfile;
       return u;
    });

    const guide = expedition && (expedition as any).trek?.guide;

    res.json({ participants, leader: guide });
  } catch (error) {
    res.status(500).json({ error: 'Roster failure' });
  }
});

export default router;
