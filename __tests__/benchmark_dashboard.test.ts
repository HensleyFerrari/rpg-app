
import mongoose from 'mongoose';
import Battle from '@/models/Battle';
import Character from '@/models/Character';
import Campaign from '@/models/Campaign';
import User from '@/models/User';
import { getBattleStatsByUser } from '@/lib/actions/battle.actions';
import { getCharacterStatsByOwner } from '@/lib/actions/character.actions';

// Mock revalidatePath
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock getCurrentUser
let currentUserId: mongoose.Types.ObjectId;
jest.mock('@/lib/actions/user.actions', () => ({
  getCurrentUser: jest.fn(() => ({
    _id: currentUserId,
    email: 'test@example.com',
  })),
}));

describe('Dashboard Actions Benchmark', () => {
  beforeEach(async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    currentUserId = user._id;

    const campaign = await Campaign.create({
      name: 'Test Campaign',
      owner: currentUserId,
      description: 'Desc',
    });

    const battles = [];
    for (let i = 0; i < 100; i++) {
      battles.push({
        name: `Battle ${i}`,
        owner: currentUserId,
        campaign: campaign._id,
        active: i < 50,
        createdAt: new Date(Date.now() - i * 1000),
      });
    }
    await Battle.insertMany(battles);

    const characters = [];
    for (let i = 0; i < 100; i++) {
      characters.push({
        name: `Character ${i}`,
        owner: currentUserId,
        campaign: campaign._id,
        status: i < 50 ? 'alive' : 'dead',
        createdAt: new Date(Date.now() - i * 1000),
      });
    }
    await Character.insertMany(characters);
  });

  it('measures the performance of dashboard stats actions', async () => {
    const start = performance.now();
    await Promise.all([
      getBattleStatsByUser(),
      getCharacterStatsByOwner(),
    ]);
    const end = performance.now();
    console.log(`Dashboard stats took ${(end - start).toFixed(2)}ms`);
  });
});
