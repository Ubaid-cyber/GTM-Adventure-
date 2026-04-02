import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// GET /api/leader/medical-records
// Scoped oversight for Leaders to view their group's health status.
router.get('/medical-records', async (req, res) => {
  try {
    const user = (req as any).user;

    if (user.role !== 'LEADER' && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access Denied: Leadership clearance required.' });
    }

    // 1. Find all treks guided by this leader
    const treks = await prisma.trek.findMany({
      where: { guideId: user.id },
      select: { id: true, title: true }
    });

    const trekIds = treks.map(t => t.id);

    // 2. Find all confirmed bookings for these treks
    const medicalProfiles = await prisma.medicalProfile.findMany({
      where: {
        user: {
          bookings: {
            some: {
              trekId: { in: trekIds },
              status: 'CONFIRMED'
            }
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      }
    });

    // 3. AUDIT LOGGING: Immutable record of sensitive data access
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LEADER_MEDICAL_OVERVIEW_ACCESS',
        ip: req.ip || '0.0.0.0',
        userAgent: req.headers['user-agent'],
        metadata: {
           accessedCount: medicalProfiles.length,
           trekIds
        }
      }
    });

    res.json(medicalProfiles);
  } catch (error: any) {
    console.error('Leader Medical Fetch Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 📡 SITREP PROTOCOL: High-fidelity status reports
router.post('/sitrep', async (req, res) => {
  try {
    const user = (req as any).user;
    const { expeditionId, status, weather, healthSummary, safetyNotes, metadata } = req.body;

    // 🛡️ SECURITY AUDIT: Verify leadership authority
    const expedition = await prisma.expedition.findUnique({
      where: { id: expeditionId },
      include: { trek: true }
    });

    if (!expedition) return res.status(404).json({ error: 'Sector not found.' });
    if (user.role !== 'ADMIN' && (user.role !== 'LEADER' || expedition.trek.guideId !== user.id)) {
       return res.status(403).json({ error: 'Unauthorized: Command clearance required.' });
    }

    const sitrep = await prisma.situationReport.create({
      data: {
        expeditionId,
        leaderId: user.id,
        status,
        weather,
        healthSummary,
        safetyNotes,
        metadata
      }
    });

    // 📝 AUDIT LOGGING: Immutable trace of SITREP submission
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LEADER_SITREP_SUBMISSION',
        ip: req.ip || '0.0.0.0',
        userAgent: req.headers['user-agent'],
        metadata: { expeditionId, status }
      }
    });

    res.json(sitrep);
  } catch (error: any) {
    console.error('SITREP Post Error:', error);
    res.status(500).json({ error: 'Failed to log SITREP.' });
  }
});

// ✅ OPERATIONAL CHECKLISTS: Milestone-based safety verification
router.post('/checklists', async (req, res) => {
  try {
    const user = (req as any).user;
    const { expeditionId, phase, checkpointData } = req.body;

    const expedition = await prisma.expedition.findUnique({
      where: { id: expeditionId },
      include: { trek: true }
    });

    if (!expedition) return res.status(404).json({ error: 'Sector not found.' });
    if (user.role !== 'ADMIN' && (user.role !== 'LEADER' || expedition.trek.guideId !== user.id)) {
       return res.status(403).json({ error: 'Unauthorized: Command clearance required.' });
    }

    const checklist = await prisma.operationalChecklist.upsert({
      where: { expeditionId_phase: { expeditionId, phase } },
      update: {
        status: 'VERIFIED',
        completedBy: user.id,
        verifiedAt: new Date(),
        checkpointData
      },
      create: {
        expeditionId,
        phase,
        status: 'VERIFIED',
        completedBy: user.id,
        verifiedAt: new Date(),
        checkpointData
      }
    });

    // 📝 AUDIT LOGGING: Immutable safety trace
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LEADER_CHECKLIST_VERIFICATION',
        ip: req.ip || '0.0.0.0',
        userAgent: req.headers['user-agent'],
        metadata: { expeditionId, phase }
      }
    });

    res.json(checklist);
  } catch (error: any) {
    console.error('Checklist Post Error:', error);
    res.status(500).json({ error: 'Failed to verify checklist.' });
  }
});

export default router;
