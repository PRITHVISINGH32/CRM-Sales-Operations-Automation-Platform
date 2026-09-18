// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.activity.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.deal.deleteMany({});
  await prisma.contact.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding Demo Users...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@revopsflow.demo',
      password: 'DemoPassword123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    }
  });

  const salesUser = await prisma.user.create({
    data: {
      email: 'sales@revopsflow.demo',
      password: 'DemoPassword123!',
      firstName: 'Sales',
      lastName: 'Rep',
      role: 'SALES_REP',
    }
  });

  console.log('Seeding Companies...');
  const companies = [];
  const industries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing'];
  const countries = ['USA', 'UK', 'Germany', 'France', 'Canada'];
  const sizes = ['1-10', '11-50', '51-200', '201-500', '500+'];
  const stages = ['Lead', 'Subscriber', 'Customer', 'Evangelist'];

  for (let i = 1; i <= 30; i++) {
    const company = await prisma.company.create({
      data: {
        name: `Company ${i} Ltd.`,
        website: `https://company${i}.example.com`,
        industry: industries[i % industries.length],
        country: countries[i % countries.length],
        companySize: sizes[i % sizes.length],
        annualRevenue: 500000 + (i * 100000),
        ownerId: i % 2 === 0 ? adminUser.id : salesUser.id,
        lifecycleStage: stages[i % stages.length],
      }
    });
    companies.push(company);
  }

  console.log('Seeding Contacts...');
  const contacts = [];
  const jobTitles = ['CEO', 'CTO', 'Manager', 'Developer', 'Analyst'];
  const leadSources = ['Organic Search', 'Direct Traffic', 'Social Media', 'Referrals'];
  const contactStages = ['Lead', 'MQL', 'SQL', 'Opportunity', 'Customer'];
  const contactStatuses = ['New', 'Contacted', 'Qualified', 'Unqualified'];

  for (let i = 1; i <= 100; i++) {
    const company = companies[i % companies.length];
    const contact = await prisma.contact.create({
      data: {
        firstName: `ContactFn${i}`,
        lastName: `ContactLn${i}`,
        email: `contact${i}@example.com`,
        phone: `+1-555-${String(i).padStart(4, '0')}`,
        companyId: company.id,
        jobTitle: jobTitles[i % jobTitles.length],
        industry: company.industry,
        country: company.country,
        leadSource: leadSources[i % leadSources.length],
        lifecycleStage: contactStages[i % contactStages.length],
        leadScore: Math.floor(Math.random() * 100),
        ownerId: i % 2 === 0 ? adminUser.id : salesUser.id,
        status: contactStatuses[i % contactStatuses.length],
      }
    });
    contacts.push(contact);
  }

  console.log('Seeding Deals...');
  const deals = [];
  const dealStages = ['NEW LEAD', 'QUALIFIED', 'CONTACTED', 'MEETING BOOKED', 'PROPOSAL SENT', 'NEGOTIATION', 'WON', 'LOST'];
  const probabilities = [10, 25, 35, 50, 70, 85, 100, 0];

  for (let i = 1; i <= 50; i++) {
    const stageIndex = i % dealStages.length;
    const contact = contacts[i % contacts.length];
    const deal = await prisma.deal.create({
      data: {
        name: `Deal for ${contact.companyId ? 'Company' : 'Contact'} ${i}`,
        companyId: contact.companyId,
        contactId: contact.id,
        value: 10000 + (Math.random() * 90000),
        stage: dealStages[stageIndex],
        probability: probabilities[stageIndex],
        expectedCloseDate: new Date(Date.now() + (Math.random() * 10000000000)),
        ownerId: i % 2 === 0 ? adminUser.id : salesUser.id,
        leadSource: contact.leadSource,
      }
    });
    deals.push(deal);
  }

  console.log('Seeding Tasks...');
  const priorities = ['Low', 'Medium', 'High'];
  const taskStatuses = ['TODO', 'IN PROGRESS', 'COMPLETED', 'OVERDUE'];
  
  for (let i = 1; i <= 50; i++) {
    const contact = contacts[i % contacts.length];
    await prisma.task.create({
      data: {
        name: `Follow up task ${i}`,
        contactId: contact.id,
        companyId: contact.companyId,
        ownerId: contact.ownerId,
        priority: priorities[i % priorities.length],
        status: taskStatuses[i % taskStatuses.length],
        dueDate: new Date(Date.now() + (Math.random() * 5000000000) - 1000000000),
      }
    });
  }

  console.log('Seeding Activities...');
  const activityTypes = ['Call', 'Email', 'Meeting', 'Note'];
  
  for (let i = 1; i <= 100; i++) {
    const deal = deals[i % deals.length];
    await prisma.activity.create({
      data: {
        type: activityTypes[i % activityTypes.length],
        description: `Activity detail ${i}`,
        contactId: deal.contactId,
        companyId: deal.companyId,
        dealId: deal.id,
      }
    });
  }

  console.log('Database seeded successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
