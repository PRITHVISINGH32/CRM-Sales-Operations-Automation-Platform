import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export async function ensureDatabaseSeeded() {
  try {
    const eventCount = await prisma.event.count();
    if (eventCount > 0) {
      console.log(`✅ Database ready with ${eventCount} events.`);
      return;
    }

    console.log('🌱 Auto-seeding database with 22 default events & shows...');

    const passwordHash = await bcrypt.hash('password123', 10);

    const customer = await prisma.user.upsert({
      where: { email: 'customer@example.com' },
      update: {},
      create: {
        email: 'customer@example.com',
        passwordHash,
        name: 'prithvi (Customer)',
        role: 'CUSTOMER',
      },
    });

    const organiser = await prisma.user.upsert({
      where: { email: 'organiser@example.com' },
      update: {},
      create: {
        email: 'organiser@example.com',
        passwordHash,
        name: 'Event Organiser',
        role: 'ORGANISER',
      },
    });

    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        passwordHash,
        name: 'System Admin',
        role: 'ADMIN',
      },
    });

    const venueCinema = await prisma.venue.create({
      data: {
        name: 'PVR Grand IMAX Arena',
        location: 'Lower Parel, Mumbai',
      },
    });

    const catPremium = await prisma.seatCategory.create({
      data: {
        venueId: venueCinema.id,
        name: 'VIP Recliner / Premium',
      },
    });

    const catStandard = await prisma.seatCategory.create({
      data: {
        venueId: venueCinema.id,
        name: 'Standard Executive',
      },
    });

    const physicalSeats = [];
    const rows = ['A', 'B', 'C', 'D'];

    for (const rowLabel of rows) {
      const categoryId = (rowLabel === 'A' || rowLabel === 'B') ? catPremium.id : catStandard.id;
      for (let num = 1; num <= 10; num++) {
        const seat = await prisma.seat.create({
          data: {
            venueId: venueCinema.id,
            categoryId,
            rowLabel,
            seatNumber: num,
          },
        });
        physicalSeats.push(seat);
      }
    }

    const eventsData = [
      {
        title: 'Oppenheimer',
        description: 'Christopher Nolan’s epic biographical thriller about J. Robert Oppenheimer and the Manhattan Project.',
        type: 'MOVIE',
        durationMinutes: 180,
        posterUrl: '/images/oppenheimer.jpg',
      },
      {
        title: 'The Last of Us: Live Experience',
        description: 'A cinematic orchestral performance and screening of HBO’s masterpiece with live sound stage.',
        type: 'MOVIE',
        durationMinutes: 140,
        posterUrl: '/images/last-of-us.jpg',
      },
      {
        title: 'Kathakali: Sacred Dance Drama',
        description: 'Traditional classical Indian dance-drama known for intricate face art, mudras, and heroic mythology.',
        type: 'CONCERT',
        durationMinutes: 120,
        posterUrl: '/images/kathakali.png',
      },
      {
        title: 'Billie Eilish: Hit Me Hard and Soft Tour',
        description: 'Grammy & Oscar-winning global sensation performing live with full acoustic and electronic production.',
        type: 'CONCERT',
        durationMinutes: 150,
        posterUrl: '/images/billie-eilish.png',
      },
      {
        title: 'Hanumankind: Big Dawgs World Tour',
        description: 'High-octane Indian hip-hop headliner performing viral hits with live brass band and visuals.',
        type: 'CONCERT',
        durationMinutes: 130,
        posterUrl: '/images/hanumankind.png',
      },
      {
        title: 'Coldplay: Music of the Spheres',
        description: 'The world’s biggest eco-friendly stadium spectacle featuring kinetic floors and LED wristband lightshows.',
        type: 'CONCERT',
        durationMinutes: 160,
        posterUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators.',
        type: 'MOVIE',
        durationMinutes: 166,
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Avengers: Secret Wars',
        description: 'The ultimate multiverse showdown assembling heroes across dimensions for the final multiverse war.',
        type: 'MOVIE',
        durationMinutes: 185,
        posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Interstellar: 10th Anniversary IMAX',
        description: 'Relive Christopher Nolan’s space exploration epic scored by Hans Zimmer in 70mm IMAX format.',
        type: 'MOVIE',
        durationMinutes: 169,
        posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'A.R. Rahman: Live in Concert',
        description: 'The Academy Award-winning maestro performs timeless classics with a 50-piece symphony orchestra.',
        type: 'CONCERT',
        durationMinutes: 180,
        posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Taylor Swift: The Eras Tour',
        description: 'A 3-hour journey through 10 iconic musical eras with stunning set changes and pyrotechnics.',
        type: 'CONCERT',
        durationMinutes: 195,
        posterUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'The Dark Knight: IMAX Re-Release',
        description: 'Heath Ledger’s legendary Oscar-winning performance as the Joker in Christopher Nolan’s Gotham.',
        type: 'MOVIE',
        durationMinutes: 152,
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Sunburn Electronic Music Festival',
        description: 'Asia’s premier EDM festival featuring world top DJs, laser displays, and beach stage production.',
        type: 'CONCERT',
        durationMinutes: 240,
        posterUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Kantara: Chapter 1',
        description: 'The ancient saga of divine judgment, forest folklore, and ancestral warrior traditions.',
        type: 'MOVIE',
        durationMinutes: 160,
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Lollapalooza India 2026',
        description: 'Multi-genre music festival bringing international indie, rock, and pop icons to Mumbai.',
        type: 'CONCERT',
        durationMinutes: 300,
        posterUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc436?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Avatar: Fire and Ash',
        description: 'James Cameron takes us back to Pandora to meet the Ash People in unchartered volcanic regions.',
        type: 'MOVIE',
        durationMinutes: 190,
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Zakir Hussain: Tabla Beats Live',
        description: 'Grammy-winning maestro Zakir Hussain performs improvisational Indian classical fusion.',
        type: 'CONCERT',
        durationMinutes: 120,
        posterUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Spider-Man: Beyond the Spider-Verse',
        description: 'Miles Morales navigates the multiverse in the thrilling conclusion to the Spider-Verse trilogy.',
        type: 'MOVIE',
        durationMinutes: 145,
        posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Diljit Dosanjh: Dil-Luminati Tour',
        description: 'Global Punjabi superstar Diljit Dosanjh performs energetic Punjabi pop and bhangra hits.',
        type: 'CONCERT',
        durationMinutes: 150,
        posterUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Gladiator II',
        description: 'Years after Maximus’ death, Lucius enters the Colosseum to restore glory to Rome.',
        type: 'MOVIE',
        durationMinutes: 150,
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Standup Comedy Arena: All Stars',
        description: 'Top Indian standup comedians perform 2 hours of uncensored observational hilarity.',
        type: 'CONCERT',
        durationMinutes: 110,
        posterUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=600&q=80',
      },
      {
        title: 'Inception: Live Score Edition',
        description: 'Watch the mind-bending dream thriller with Hans Zimmer’s brass score performed live on stage.',
        type: 'MOVIE',
        durationMinutes: 148,
        posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      },
    ];

    for (let i = 0; i < eventsData.length; i++) {
      const item = eventsData[i];

      const createdEvent = await prisma.event.create({
        data: {
          title: item.title,
          description: item.description,
          type: item.type as any,
          posterUrl: item.posterUrl,
          organiserId: organiser.id,
        },
      });

      const startTime = new Date();
      startTime.setDate(startTime.getDate() + (i % 7) + 1);
      startTime.setHours(18 + (i % 4), 0, 0, 0);

      const endTime = new Date(startTime.getTime() + item.durationMinutes * 60 * 1000);

      const show = await prisma.show.create({
        data: {
          eventId: createdEvent.id,
          venueId: venueCinema.id,
          startTime,
          endTime,
        },
      });

      const isSpecial = i < 5;
      const premiumPrice = isSpecial ? 1500 : 500;
      const standardPrice = isSpecial ? 900 : 300;

      await prisma.showCategoryPrice.createMany({
        data: [
          { showId: show.id, categoryId: catPremium.id, price: premiumPrice },
          { showId: show.id, categoryId: catStandard.id, price: standardPrice },
        ],
      });

      const showSeatData = physicalSeats.map((seat) => ({
        showId: show.id,
        seatId: seat.id,
        categoryId: seat.categoryId,
        status: 'AVAILABLE' as const,
      }));

      await prisma.showSeat.createMany({
        data: showSeatData,
      });
    }

    console.log('🎉 Auto-seeded 22 events successfully!');
  } catch (err) {
    console.error('Auto-seed check failed:', err);
  }
}   