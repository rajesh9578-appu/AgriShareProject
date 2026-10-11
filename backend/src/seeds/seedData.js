const mongoose = require('mongoose');
const dotenv = require('dotenv');
const env = require('../config/env');
const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const Resource = require('../models/Resource');
const ResourceCategory = require('../models/ResourceCategory');
const Crop = require('../models/Crop');
const ResourceRequest = require('../models/ResourceRequest');
const Booking = require('../models/Booking');
const Rating = require('../models/Rating');
const Notification = require('../models/Notification');
const PlatformActivity = require('../models/PlatformActivity');

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('[Seed] Connected to MongoDB for seeding...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany(),
      FarmerProfile.deleteMany(),
      Resource.deleteMany(),
      ResourceCategory.deleteMany(),
      Crop.deleteMany(),
      ResourceRequest.deleteMany(),
      Booking.deleteMany(),
      Rating.deleteMany(),
      Notification.deleteMany(),
      PlatformActivity.deleteMany()
    ]);
    console.log('[Seed] Existing platform data wiped clean.');

    // 1. Seed Resource Categories
    const categories = await ResourceCategory.insertMany([
      {
        name: 'Tractor',
        slug: 'tractor',
        description: 'High-power tractors for primary and secondary tillage, haulage, and field preparation.',
        icon: 'Tractor',
        typicalOperations: ['Plowing', 'Harrowing', 'Levelling', 'Transport'],
        suggestedUnits: ['per_hour', 'per_day', 'per_acre']
      },
      {
        name: 'Rotavator',
        slug: 'rotavator',
        description: 'Rotary tillers for pulverizing soil, weed chopping, and fine seedbed preparation.',
        icon: 'Cog',
        typicalOperations: ['Seedbed Preparation', 'Puddling', 'Stubble Mixing'],
        suggestedUnits: ['per_hour', 'per_acre', 'per_day']
      },
      {
        name: 'Combine Harvester',
        slug: 'combine-harvester',
        description: 'Multi-crop combine harvesters for cutting, threshing, and cleaning grains in a single pass.',
        icon: 'Wheat',
        typicalOperations: ['Harvesting', 'Threshing', 'Grain Cleaning'],
        suggestedUnits: ['per_hour', 'per_acre']
      },
      {
        name: 'Sprayer',
        slug: 'sprayer',
        description: 'Boom sprayers, drone sprayers, and power sprayers for crop protection and foliar nutrition.',
        icon: 'CloudRain',
        typicalOperations: ['Pest Control', 'Foliar Fertilizer Application', 'Weedicide Spray'],
        suggestedUnits: ['per_day', 'per_acre', 'per_hour']
      },
      {
        name: 'Seed Drill',
        slug: 'seed-drill',
        description: 'Precision seed cum fertilizer drills for uniform seed placement and depth control.',
        icon: 'Sprout',
        typicalOperations: ['Sowing', 'Direct Seeding', 'Fertilizer Placement'],
        suggestedUnits: ['per_acre', 'per_day']
      },
      {
        name: 'Drip Irrigation Equipment',
        slug: 'drip-irrigation',
        description: 'Drip laterals, venturi injectors, disc filters, and portable micro-irrigation units.',
        icon: 'Droplets',
        typicalOperations: ['Micro Irrigation', 'Fertigation', 'Water Conservation'],
        suggestedUnits: ['per_day', 'fixed']
      },
      {
        name: 'Water Pump',
        slug: 'water-pump',
        description: 'Diesel and solar water pumps for irrigation canal lifting and farm pond dewatering.',
        icon: 'Activity',
        typicalOperations: ['Irrigation Pumping', 'Water Transfer', 'Drainage'],
        suggestedUnits: ['per_hour', 'per_day']
      },
      {
        name: 'Agricultural Transport',
        slug: 'agricultural-transport',
        description: 'Heavy tractor trolleys and pickup vehicles for farm-to-mandi crop transport.',
        icon: 'Truck',
        typicalOperations: ['Produce Haulage', 'Manure Transport', 'Harvest Transport'],
        suggestedUnits: ['per_trip', 'per_day']
      },
      {
        name: 'Storage Space',
        slug: 'storage-space',
        description: 'Secure, aerated warehouse and cold storage space for harvested produce.',
        icon: 'Warehouse',
        typicalOperations: ['Grain Storage', 'Produce Preservation', 'Inventory Management'],
        suggestedUnits: ['per_day', 'fixed']
      }
    ]);
    console.log(`[Seed] Created ${categories.length} resource categories.`);

    // 2. Seed Crops
    const crops = await Crop.insertMany([
      {
        name: 'Paddy (Rice)',
        category: 'Cereals',
        seasons: ['Kuruvai (June-Sept)', 'Samba (Aug-Jan)', 'Navarai (Dec-May)'],
        soilTypes: ['Alluvial Soil', 'Clayey Loam', 'Black Soil'],
        stages: [
          { stageName: 'Land Preparation', description: 'Deep plowing and puddling in standing water', durationDays: 14, recommendedEquipment: ['Tractor', 'Rotavator', 'Disc Plough'] },
          { stageName: 'Sowing / Transplanting', description: 'Mechanical nursery transplanting or direct seed drilling', durationDays: 10, recommendedEquipment: ['Paddy Transplanter', 'Seed Drill'] },
          { stageName: 'Crop Care & Weeding', description: 'Cono-weeder and micronutrient spray application', durationDays: 45, recommendedEquipment: ['Power Weeder', 'Sprayer'] },
          { stageName: 'Harvesting', description: 'Grain cutting, threshing, and bagging', durationDays: 7, recommendedEquipment: ['Combine Harvester', 'Tractor Trolley'] }
        ],
        commonEquipmentNeeded: ['Tractor', 'Rotavator', 'Combine Harvester', 'Sprayer']
      },
      {
        name: 'Cotton',
        category: 'Commercial / Cash',
        seasons: ['Kharif (Monsoon)', 'Summer Irrigated'],
        soilTypes: ['Black Soil', 'Red Soil'],
        stages: [
          { stageName: 'Land Preparation', description: 'Deep subsoiling and ridge formation', durationDays: 15, recommendedEquipment: ['Tractor', 'Cultivator', 'Ridge Maker'] },
          { stageName: 'Sowing', description: 'Precision seed spacing with dibbler/drill', durationDays: 7, recommendedEquipment: ['Seed Drill'] },
          { stageName: 'Crop Protection', description: 'Bollworm and sucking pest spraying', durationDays: 60, recommendedEquipment: ['Sprayer', 'Drone Sprayer'] },
          { stageName: 'Harvesting', description: 'Multi-stage manual/machine picking and bagging', durationDays: 30, recommendedEquipment: ['Agricultural Transport'] }
        ],
        commonEquipmentNeeded: ['Tractor', 'Cultivator', 'Sprayer', 'Drip Irrigation Equipment']
      },
      {
        name: 'Sugarcane',
        category: 'Commercial / Cash',
        seasons: ['Main Season (Dec-March)', 'Special Season (June-July)'],
        soilTypes: ['Alluvial Soil', 'Clayey Loam', 'Red Soil'],
        stages: [
          { stageName: 'Land Preparation', description: 'Deep trenching and furrowing', durationDays: 20, recommendedEquipment: ['Tractor', 'Disc Plough', 'Furrower'] },
          { stageName: 'Sett Planting', description: 'Sugarcane cutter planter', durationDays: 10, recommendedEquipment: ['Planter Attachment'] },
          { stageName: 'Earthing Up & Weeding', description: 'Inter-cultivation with power tillers', durationDays: 90, recommendedEquipment: ['Power Weeder', 'Tractor'] },
          { stageName: 'Harvest & Haulage', description: 'Cane cutting and mill transport', durationDays: 15, recommendedEquipment: ['Agricultural Transport', 'Tractor Trolley'] }
        ],
        commonEquipmentNeeded: ['Tractor', 'Power Weeder', 'Drip Irrigation Equipment', 'Agricultural Transport']
      },
      {
        name: 'Maize (Corn)',
        category: 'Cereals',
        seasons: ['Kharif', 'Rabi'],
        soilTypes: ['Red Loam', 'Sandy Loam', 'Black Soil'],
        commonEquipmentNeeded: ['Tractor', 'Seed Drill', 'Sprayer', 'Thresher']
      },
      {
        name: 'Groundnut',
        category: 'Oilseeds',
        seasons: ['Kharif (Rainfed)', 'Rabi (Irrigated)'],
        soilTypes: ['Sandy Loam', 'Red Soil'],
        commonEquipmentNeeded: ['Tractor', 'Rotavator', 'Seed Drill', 'Groundnut Digger']
      }
    ]);
    console.log(`[Seed] Created ${crops.length} crops with agronomic profiles.`);

    // 3. Create Users
    // Admin (Configured via .env)
    let adminUser = null;
    if (env.ADMIN && env.ADMIN.EMAIL && env.ADMIN.PASSWORD) {
      adminUser = await User.create({
        name: env.ADMIN.NAME || 'Platform Administrator',
        email: env.ADMIN.EMAIL,
        password: env.ADMIN.PASSWORD,
        role: 'admin',
        phone: env.ADMIN.PHONE || '+91 98401 23456',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
      });
      console.log(`[Seed] Created Admin account for: ${env.ADMIN.EMAIL}`);
    } else {
      console.log('[Seed] Notice: No ADMIN_EMAIL in .env. Admin will be created when ADMIN_EMAIL & ADMIN_PASSWORD are provided in .env.');
    }

    // User 1 (Madurai - Paddy Farmer & Equipment Seeker/Provider)
    const farmer1 = await User.create({
      name: 'Murugan Ramasamy',
      email: 'farmer.murugan@agrishare.ai',
      password: 'Farmer@123Password',
      role: 'user',
      isOwnerActive: true,
      phone: '+91 94432 10987',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
    });

    await FarmerProfile.create({
      user: farmer1._id,
      village: 'Samayanallur',
      taluk: 'Madurai North',
      district: 'Madurai',
      state: 'Tamil Nadu',
      landArea: 3.5,
      landUnit: 'acres',
      soilType: 'Clayey Loam',
      irrigationType: 'Canal Irrigation',
      cropsCultivated: ['Paddy (Rice)', 'Banana'],
      farmingExperience: 12,
      preferredResources: ['Tractor', 'Rotavator', 'Combine Harvester'],
      location: {
        type: 'Point',
        coordinates: [78.0768, 9.9862],
        address: 'Samayanallur Main Rd, Madurai North, Tamil Nadu 625402'
      },
      verificationStatus: 'VERIFIED'
    });

    // User 2 (Thirumangalam - Cotton & Maize)
    const farmer2 = await User.create({
      name: 'Selvam Subramanian',
      email: 'farmer.selvam@agrishare.ai',
      password: 'Farmer@123Password',
      role: 'user',
      isOwnerActive: true,
      phone: '+91 98940 54321',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
    });

    await FarmerProfile.create({
      user: farmer2._id,
      village: 'Kappalur',
      taluk: 'Thirumangalam',
      district: 'Madurai',
      state: 'Tamil Nadu',
      landArea: 5.0,
      landUnit: 'acres',
      soilType: 'Black Soil',
      irrigationType: 'Borewell / Well',
      cropsCultivated: ['Cotton', 'Maize (Corn)'],
      farmingExperience: 18,
      preferredResources: ['Tractor', 'Cultivator', 'Sprayer', 'Drip Irrigation Equipment'],
      location: {
        type: 'Point',
        coordinates: [77.9865, 9.8242],
        address: 'Kappalur Village, Thirumangalam Taluk, Madurai 625008'
      },
      verificationStatus: 'VERIFIED'
    });

    // User 3 (Karthik - Madurai Tractor & Rotavator Fleet Provider)
    const owner1 = await User.create({
      name: 'Karthik Natarajan',
      email: 'owner.karthik@agrishare.ai',
      password: 'Owner@123Password',
      role: 'user',
      isOwnerActive: true,
      phone: '+91 97890 12345',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80'
    });

    await FarmerProfile.create({
      user: owner1._id,
      village: 'Othakadai',
      taluk: 'Madurai East',
      district: 'Madurai',
      state: 'Tamil Nadu',
      landArea: 8.0,
      landUnit: 'acres',
      soilType: 'Red Soil',
      irrigationType: 'Borewell / Well',
      cropsCultivated: ['Paddy', 'Sugarcane'],
      verificationStatus: 'VERIFIED'
    });

    // User 4 (Anitha - Harvester & Boom Sprayers in Coimbatore/Salem)
    const owner2 = await User.create({
      name: 'Anitha Soundararajan',
      email: 'owner.anitha@agrishare.ai',
      password: 'Owner@123Password',
      role: 'user',
      isOwnerActive: true,
      phone: '+91 96290 87654',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
    });

    // User 5 (Rajan in Thanjavur - Dual Seeker & Provider)
    const farmerOwner = await User.create({
      name: 'Rajan Veerappan',
      email: 'farmer.rajan@agrishare.ai',
      password: 'Farmer@123Password',
      role: 'user',
      isOwnerActive: true,
      phone: '+91 95001 98765',
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80'
    });

    await FarmerProfile.create({
      user: farmerOwner._id,
      village: 'Kallaperambur',
      taluk: 'Thanjavur',
      district: 'Thanjavur',
      state: 'Tamil Nadu',
      landArea: 6.0,
      landUnit: 'acres',
      soilType: 'Alluvial Soil',
      irrigationType: 'Canal Irrigation',
      cropsCultivated: ['Paddy (Rice)', 'Groundnut'],
      verificationStatus: 'VERIFIED'
    });

    console.log('[Seed] Created admin and unified User accounts (Seekers & Providers).');

    // 4. Seed Verified Resources
    const resources = await Resource.insertMany([
      {
        name: 'Mahindra 575 DI 45HP Tractor with Driver',
        category: 'Tractor',
        description: 'Heavy duty 45 HP Mahindra Tractor with dual clutch, hydraulic draft control, and experienced operator. Excellent for deep plowing, wet puddling for paddy, and trailer haulage.',
        owner: owner1._id,
        location: {
          type: 'Point',
          coordinates: [78.1567, 9.9489],
          address: 'Othakadai Main Road, Madurai East',
          village: 'Othakadai',
          taluk: 'Madurai East',
          district: 'Madurai',
          state: 'Tamil Nadu'
        },
        availability: {
          isAvailable: true,
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          notes: 'Fuel included for local radius or charged by hour.'
        },
        pricing: {
          price: 850,
          unit: 'per_hour',
          deposit: 0,
          isNegotiable: false
        },
        photos: [
          'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1589834390005-5d4fb9bf3d32?w=800&auto=format&fit=crop&q=80'
        ],
        suitableCrops: ['Paddy (Rice)', 'Sugarcane', 'Cotton', 'Maize (Corn)', 'All Crops'],
        suitableLandSize: { min: 1.0, max: 25.0, unit: 'acres' },
        usageType: 'equipment_with_operator',
        condition: 'excellent',
        specs: {
          brand: 'Mahindra & Mahindra',
          modelYear: 2023,
          horsepower: '45 HP',
          fuelType: 'Diesel',
          withOperator: true
        },
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        ratingSummary: { average: 4.9, count: 18 },
        totalBookingsCount: 14,
        isPublished: true
      },
      {
        name: 'Shaktiman 48-Blade Rotary Tiller (Rotavator)',
        category: 'Rotavator',
        description: 'Heavy series Shaktiman rotavator designed for fine seedbed preparation in single pass. Compatible with 40-55 HP tractors.',
        owner: owner1._id,
        location: {
          type: 'Point',
          coordinates: [78.1198, 9.9252],
          address: 'Simmakkal Agricultural Hub, Madurai',
          village: 'Madurai Town',
          taluk: 'Madurai South',
          district: 'Madurai',
          state: 'Tamil Nadu'
        },
        availability: {
          isAvailable: true,
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        pricing: {
          price: 1800,
          unit: 'per_day',
          deposit: 500,
          isNegotiable: true
        },
        photos: [
          'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=800&auto=format&fit=crop&q=80'
        ],
        suitableCrops: ['Paddy (Rice)', 'Cotton', 'Maize (Corn)', 'Vegetables'],
        suitableLandSize: { min: 0.5, max: 15.0, unit: 'acres' },
        usageType: 'rental',
        condition: 'good',
        specs: {
          brand: 'Shaktiman',
          modelYear: 2022,
          horsepower: 'Suitable for 45HP+ PTO',
          fuelType: 'PTO Driven',
          withOperator: false
        },
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        ratingSummary: { average: 4.7, count: 12 },
        totalBookingsCount: 9,
        isPublished: true
      },
      {
        name: 'Kubota DC-68G Multi-Crop Combine Harvester',
        category: 'Combine Harvester',
        description: 'Track-type rubber crawler combine harvester capable of harvesting wet paddy fields with zero sinking. High harvesting efficiency with minimum grain loss.',
        owner: owner2._id,
        location: {
          type: 'Point',
          coordinates: [77.0142, 11.0168],
          address: 'Sulur Highway, Coimbatore',
          village: 'Sulur',
          taluk: 'Sulur',
          district: 'Coimbatore',
          state: 'Tamil Nadu'
        },
        availability: {
          isAvailable: true,
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        pricing: {
          price: 2400,
          unit: 'per_acre',
          deposit: 1000,
          isNegotiable: false
        },
        photos: [
          'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1595113316349-9fa4eb24f884?w=800&auto=format&fit=crop&q=80'
        ],
        suitableCrops: ['Paddy (Rice)', 'Wheat', 'Soybean'],
        suitableLandSize: { min: 2.0, max: 50.0, unit: 'acres' },
        usageType: 'equipment_with_operator',
        condition: 'excellent',
        specs: {
          brand: 'Kubota',
          modelYear: 2024,
          horsepower: '68 HP',
          fuelType: 'Diesel',
          withOperator: true
        },
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        ratingSummary: { average: 5.0, count: 24 },
        totalBookingsCount: 22,
        isPublished: true
      },
      {
        name: 'Aspee Tractor-Mounted 400L Boom Sprayer',
        category: 'Sprayer',
        description: 'High-pressure 400 litre chemical and bio-spray rig with 12 meter extendable boom arms. Ideal for cotton bollworm management, maize pest control, and paddy foliar nutrition.',
        owner: owner2._id,
        location: {
          type: 'Point',
          coordinates: [78.146, 11.6643],
          address: 'Omalur Main Road, Salem',
          village: 'Omalur',
          taluk: 'Omalur',
          district: 'Salem',
          state: 'Tamil Nadu'
        },
        availability: {
          isAvailable: true
        },
        pricing: {
          price: 1200,
          unit: 'per_day',
          deposit: 300,
          isNegotiable: false
        },
        photos: [
          'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1508873696983-2df57046475b?w=800&auto=format&fit=crop&q=80'
        ],
        suitableCrops: ['Cotton', 'Maize (Corn)', 'Sugarcane', 'Paddy (Rice)', 'Groundnut'],
        suitableLandSize: { min: 1.0, max: 20.0, unit: 'acres' },
        usageType: 'rental',
        condition: 'excellent',
        specs: {
          brand: 'Aspee',
          modelYear: 2023,
          capacity: '400 Litres',
          withOperator: false
        },
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        ratingSummary: { average: 4.8, count: 8 },
        totalBookingsCount: 7,
        isPublished: true
      },
      {
        name: 'Yanji 4-Row Riding Paddy Transplanter',
        category: 'Seed Drill',
        description: 'Automated 4-row mat-type riding transplanter. Transplants 3-4 acres per day with consistent plant-to-plant spacing and optimal seedling depth.',
        owner: farmerOwner._id,
        location: {
          type: 'Point',
          coordinates: [79.1378, 10.787],
          address: 'Kallaperambur, Thanjavur Delta',
          village: 'Kallaperambur',
          taluk: 'Thanjavur',
          district: 'Thanjavur',
          state: 'Tamil Nadu'
        },
        availability: {
          isAvailable: true
        },
        pricing: {
          price: 2000,
          unit: 'per_acre',
          deposit: 0,
          isNegotiable: false
        },
        photos: [
          'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=800&auto=format&fit=crop&q=80'
        ],
        suitableCrops: ['Paddy (Rice)'],
        suitableLandSize: { min: 1.0, max: 30.0, unit: 'acres' },
        usageType: 'equipment_with_operator',
        condition: 'excellent',
        specs: {
          brand: 'Yanji / VST Shakti',
          modelYear: 2023,
          horsepower: '5.5 HP Petrol',
          withOperator: true
        },
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        ratingSummary: { average: 4.9, count: 15 },
        totalBookingsCount: 12,
        isPublished: true
      },
      {
        name: 'Kirloskar 5 HP Portable Diesel Dewatering & Irrigation Pump',
        category: 'Water Pump',
        description: 'High suction portable centrifugal pump set with 100 ft delivery pipe and foot valve. Easily mounted on cart or field bund for flood and furrow irrigation.',
        owner: owner1._id,
        location: {
          type: 'Point',
          coordinates: [77.9865, 9.8242],
          address: 'Thirumangalam Bypass, Madurai',
          village: 'Thirumangalam',
          taluk: 'Thirumangalam',
          district: 'Madurai',
          state: 'Tamil Nadu'
        },
        availability: {
          isAvailable: true
        },
        pricing: {
          price: 450,
          unit: 'per_day',
          deposit: 200,
          isNegotiable: false
        },
        photos: [
          'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1617155093730-a8bf47be792d?w=800&auto=format&fit=crop&q=80'
        ],
        suitableCrops: ['All Crops'],
        suitableLandSize: { min: 0.5, max: 10.0, unit: 'acres' },
        usageType: 'rental',
        condition: 'good',
        specs: {
          brand: 'Kirloskar',
          horsepower: '5 HP Diesel',
          capacity: '750 LPM'
        },
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        ratingSummary: { average: 4.6, count: 6 },
        totalBookingsCount: 8,
        isPublished: true
      },
      {
        name: 'John Deere 5050D 50HP 4WD Tractor',
        category: 'Tractor',
        description: 'High performance 50 HP 4-Wheel Drive John Deere tractor with power steering and heavy drawbar pull. Ideal for heavy deep cultivation and multi-row planting.',
        owner: farmerOwner._id,
        location: {
          type: 'Point',
          coordinates: [79.1378, 10.787],
          address: 'Papanasam Road, Thanjavur',
          village: 'Papanasam',
          taluk: 'Papanasam',
          district: 'Thanjavur',
          state: 'Tamil Nadu'
        },
        availability: {
          isAvailable: true
        },
        pricing: {
          price: 950,
          unit: 'per_hour',
          deposit: 0,
          isNegotiable: false
        },
        photos: [
          'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=800&auto=format&fit=crop&q=80'
        ],
        suitableCrops: ['Paddy (Rice)', 'Sugarcane', 'Cotton', 'Maize (Corn)'],
        suitableLandSize: { min: 1.0, max: 40.0, unit: 'acres' },
        usageType: 'equipment_with_operator',
        condition: 'excellent',
        specs: {
          brand: 'John Deere',
          modelYear: 2024,
          horsepower: '50 HP',
          fuelType: 'Diesel',
          withOperator: true
        },
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        ratingSummary: { average: 5.0, count: 11 },
        totalBookingsCount: 10,
        isPublished: true
      },
      {
        name: 'Heavy Duty 5-Ton Hydraulic Tipping Farm Trolley',
        category: 'Agricultural Transport',
        description: 'Reinforced 5-ton payload hydraulic tipping trailer with robust side panels and high-flotation farm tyres for quick produce haulage.',
        owner: owner1._id,
        location: {
          type: 'Point',
          coordinates: [78.1198, 9.9252],
          address: 'Melur Road, Madurai',
          village: 'Melur',
          taluk: 'Melur',
          district: 'Madurai',
          state: 'Tamil Nadu'
        },
        availability: {
          isAvailable: true
        },
        pricing: {
          price: 1500,
          unit: 'per_day',
          deposit: 500,
          isNegotiable: true
        },
        photos: [
          'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&auto=format&fit=crop&q=80'
        ],
        suitableCrops: ['All Crops', 'Paddy (Rice)', 'Sugarcane'],
        suitableLandSize: { min: 1.0, max: 50.0, unit: 'acres' },
        usageType: 'rental',
        condition: 'excellent',
        specs: {
          brand: 'Standard Fabricators',
          capacity: '5 Tons'
        },
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        ratingSummary: { average: 4.8, count: 7 },
        totalBookingsCount: 6,
        isPublished: true
      }
    ]);
    console.log(`[Seed] Created ${resources.length} verified agricultural equipment listings.`);

    // 5. Create Completed Booking + Ratings
    const startDate1 = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    const endDate1 = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000);

    const booking1 = await Booking.create({
      bookingReference: 'AGRI-2026-MAD001',
      farmer: farmer1._id,
      resource: resources[0]._id, // Mahindra Tractor
      owner: owner1._id,
      startDate: startDate1,
      endDate: endDate1,
      durationDays: 2,
      location: {
        address: 'Samayanallur Main Rd, Madurai North',
        village: 'Samayanallur',
        district: 'Madurai',
        state: 'Tamil Nadu'
      },
      pricing: {
        pricePerUnit: 850,
        unit: 'per_hour',
        totalAmount: 3400,
        deposit: 0
      },
      status: 'COMPLETED',
      completedAt: endDate1,
      farmerRatingGiven: true,
      ownerRatingGiven: false
    });

    await Rating.create({
      booking: booking1._id,
      resource: resources[0]._id,
      reviewer: farmer1._id,
      reviewee: owner1._id,
      role: 'farmer_to_owner',
      rating: 5,
      review: 'Exceptional service! Tractor operator arrived promptly at 6:30 AM and completed 3.5 acres of wetland puddling smoothly. Very cooperative owner.',
      tags: ['On-time Arrival', 'Skilled Operator', 'Fuel Efficient']
    });

    // 6. Create Active / Confirmed Booking
    const startDate2 = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const endDate2 = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

    const booking2 = await Booking.create({
      bookingReference: 'AGRI-2026-MAD002',
      farmer: farmer2._id,
      resource: resources[1]._id, // Rotavator
      owner: owner1._id,
      startDate: startDate2,
      endDate: endDate2,
      durationDays: 2,
      location: {
        address: 'Kappalur Village, Thirumangalam',
        village: 'Kappalur',
        district: 'Madurai',
        state: 'Tamil Nadu'
      },
      pricing: {
        pricePerUnit: 1800,
        unit: 'per_day',
        totalAmount: 3600,
        deposit: 500
      },
      status: 'CONFIRMED',
      confirmedAt: new Date()
    });

    // 7. Create Pending Resource Request
    const request1 = await ResourceRequest.create({
      farmer: farmer1._id,
      resource: resources[4]._id, // Paddy Transplanter
      owner: farmerOwner._id,
      requiredStartDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      requiredEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      durationDays: 2,
      purpose: 'Paddy nursery mechanical transplanting for Samba season',
      crop: 'Paddy (Rice)',
      landArea: { value: 3.5, unit: 'acres' },
      location: {
        address: 'Samayanallur Main Rd, Madurai North',
        village: 'Samayanallur',
        district: 'Madurai',
        state: 'Tamil Nadu'
      },
      additionalMessage: 'Mat nursery is 18 days old and ready for transplantation.',
      status: 'PENDING',
      estimatedCost: 7000
    });

    // 8. Notifications
    await Notification.create([
      {
        recipient: farmer1._id,
        title: 'Booking Completed - Review Available',
        message: 'Your rental of Mahindra 575 DI 45HP Tractor is marked completed. Thank you for your review!',
        type: 'BOOKING_COMPLETED',
        data: { bookingId: booking1._id },
        isRead: true
      },
      {
        recipient: farmer2._id,
        title: 'Booking Confirmed: AGRI-2026-MAD002',
        message: 'Your booking for Shaktiman Rotavator is confirmed for next week.',
        type: 'BOOKING_CONFIRMED',
        data: { bookingId: booking2._id },
        isRead: false
      },
      {
        recipient: farmerOwner._id,
        sender: farmer1._id,
        title: 'New Resource Request: Paddy Transplanter 🌾',
        message: 'Murugan Ramasamy requested your Yanji Transplanter for 3.5 acres in Madurai.',
        type: 'REQUEST_RECEIVED',
        data: { requestId: request1._id },
        isRead: false
      }
    ]);

    // 9. Platform Activity Logs for Demand Analysis
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const historicalActivities = [];

    months.forEach(m => {
      // Tractor activity
      for (let i = 0; i < (m >= 6 && m <= 10 ? 14 : 5); i++) {
        historicalActivities.push({
          action: 'REQUEST_SUBMITTED',
          category: 'Tractor',
          district: 'Madurai',
          crop: 'Paddy (Rice)',
          month: m,
          year: 2026
        });
      }
      // Sprayer activity
      for (let i = 0; i < (m >= 7 && m <= 11 ? 10 : 3); i++) {
        historicalActivities.push({
          action: 'BOOKING_COMPLETED',
          category: 'Sprayer',
          district: 'Salem',
          crop: 'Cotton',
          month: m,
          year: 2026
        });
      }
      // Harvester activity
      for (let i = 0; i < (m === 1 || m === 2 || m === 9 || m === 10 ? 12 : 2); i++) {
        historicalActivities.push({
          action: 'BOOKING_COMPLETED',
          category: 'Combine Harvester',
          district: 'Thanjavur',
          crop: 'Paddy (Rice)',
          month: m,
          year: 2026
        });
      }
    });

    await PlatformActivity.insertMany(historicalActivities);
    console.log(`[Seed] Ingested ${historicalActivities.length} platform demand & activity data points.`);

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('------------------------------------------------------');
    console.log('Sample Accounts for Testing (Unified User Role):');
    if (env.ADMIN && env.ADMIN.EMAIL) {
      console.log(`1. Admin (From .env):   ${env.ADMIN.EMAIL}`);
    } else {
      console.log('1. Admin:               Configure ADMIN_EMAIL & ADMIN_PASSWORD in backend/.env');
    }
    console.log('2. User (Madurai):      farmer.murugan@agrishare.ai | Password: Farmer@123Password');
    console.log('3. User (Cotton):       farmer.selvam@agrishare.ai  | Password: Farmer@123Password');
    console.log('4. User (Fleet):        owner.karthik@agrishare.ai   | Password: Owner@123Password');
    console.log('5. User (Thanjavur):    farmer.rajan@agrishare.ai   | Password: Farmer@123Password');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
