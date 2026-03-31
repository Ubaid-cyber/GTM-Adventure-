const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING PROFESSIONAL EXPEDITION DATA ---');

  const treks = await prisma.trek.findMany();

  for (const trek of treks) {
    let itinerary = [];
    let gear = ['Trekking Boots', 'Waterproof Shell', 'Down Jacket', 'Daypack (30L)', 'Sun Hat', 'Thermal Layers'];
    let inclusions = ['Expert Sherpa Guide', 'All Permits & Fees', 'Medical Kit', 'Pulse Oximeter Monitoring', '3 Meals per Day', 'Standard Accommodations'];
    let exclusions = ['International Flights', 'Travel Insurance', 'Personal Equipment', 'Tips for Staff', 'Extra Snacks/Drinks'];

    if (trek.title.toLowerCase().includes('everest')) {
      itinerary = [
         { day: 1, title: 'Arrival in Kathmandu', activity: 'Meet our team at the airport and transfer to your hotel. Evening briefing and welcome dinner.', alt: 1400 },
         { day: 2, title: 'Fly to Lukla, Trek to Phakding', activity: 'Thrilling flight to Lukla (2840m). Begin trekking to Phakding through lush landscapes.', alt: 2610 },
         { day: 3, title: 'Trek to Namche Bazaar', activity: 'Ascent to the famous Sherpa capital. Crossing suspension bridges over the Dudh Koshi river.', alt: 3440 },
         { day: 4, title: 'Acclimatization in Namche', activity: 'Hike to Hotel Everest View for panoramic views of Everest and Ama Dablam.', alt: 3440 },
         { day: 5, title: 'Trek to Tengboche', activity: 'Visit the famous monastery and witness the sunset over the giant peaks.', alt: 3860 },
         { day: 6, title: 'Trek to Dingboche', activity: 'Walk through alpine meadows and cross the Imja Tse river.', alt: 4410 },
         { day: 7, title: 'Acclimatization in Dingboche', activity: 'Hike to Nangkartshang Peak for stunning views of Makalu and Island Peak.', alt: 4410 },
         { day: 8, title: 'Trek to Lobuche', activity: 'Walking along the lateral moraine of the Khumbu Glacier.', alt: 4910 },
         { day: 9, title: 'Gorakshep & Everest Base Camp', activity: 'Reach the foot of the world\'s highest peak. Return to Gorakshep for the night.', alt: 5364 },
         { day: 10, title: 'Kala Patthar & Pheriche', activity: 'Early morning hike to Kala Patthar (5545m) for the best Everest view. Descend to Pheriche.', alt: 5545 },
         { day: 11, title: 'Descend to Namche', activity: 'Long descent back to lower altitudes and celebrations in Namche.', alt: 3440 },
         { day: 12, title: 'Return to Lukla', activity: 'Final day of trekking. Evening party with the crew.', alt: 2840 },
         { day: 13, title: 'Flight to Kathmandu', activity: 'Return to the capital for rest and shopping.', alt: 1400 }
      ];
      gear.push('High-Altitude Down Suit', 'Crampons', 'Ice Axe (for technical sections)');
    } else {
      // General 7-day itinerary for others
      for (let i = 1; i <= trek.durationDays; i++) {
        itinerary.push({ 
          day: i, 
          title: `Expedition Stage ${i}`, 
          activity: `Progressing through ${trek.location} towards the target objective. Team synchronization and high-altitude conditioning.`,
          alt: 2000 + (i * 300)
        });
      }
    }

    await prisma.trek.update({
      where: { id: trek.id },
      data: {
        itinerary,
        gearRequirements: gear,
        inclusions,
        exclusions
      }
    });
    console.log(`Updated trek: ${trek.title}`);
  }

  console.log('--- SEEDING COMPLETE ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
