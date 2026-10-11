const User = require('../models/User');
const env = require('../config/env');

/**
 * Initialize or synchronize the Admin account based on .env configuration
 */
const initAdminUser = async () => {
  try {
    const adminEmail = env.ADMIN.EMAIL;
    const adminPassword = env.ADMIN.PASSWORD;
    const adminName = env.ADMIN.NAME || 'Platform Administrator';
    const adminPhone = env.ADMIN.PHONE || '';

    if (!adminEmail) {
      return;
    }

    let admin = await User.findOne({ email: adminEmail }).select('+password');

    if (!admin) {
      if (adminPassword) {
        admin = await User.create({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
          phone: adminPhone,
          role: 'admin',
          isVerified: true,
          isActive: true
        });
        console.log(`[Admin Init] ✅ Admin account auto-provisioned for: ${adminEmail}`);
      } else {
        console.log(`[Admin Init] ℹ️ Admin Email configured: ${adminEmail}`);
        console.log(`[Admin Init] 🔐 No password in .env. You can register with your own private password at http://localhost:5173/register`);
      }
      return;
    }
      let isUpdated = false;

      if (admin.role !== 'admin') {
        admin.role = 'admin';
        isUpdated = true;
      }
      if (!admin.isVerified) {
        admin.isVerified = true;
        isUpdated = true;
      }
      if (!admin.isActive) {
        admin.isActive = true;
        isUpdated = true;
      }
      if (adminName && admin.name !== adminName) {
        admin.name = adminName;
        isUpdated = true;
      }
      if (adminPhone && admin.phone !== adminPhone) {
        admin.phone = adminPhone;
        isUpdated = true;
      }
      if (adminPassword) {
        const isPasswordMatch = await admin.comparePassword(adminPassword);
        if (!isPasswordMatch) {
          admin.password = adminPassword;
          isUpdated = true;
        }
      }

      if (isUpdated) {
        await admin.save();
        console.log(`[Admin Init] 🔄 Admin role & credentials synchronized for: ${adminEmail}`);
      } else {
        console.log(`[Admin Init] 🛡️ Admin account verified and active for: ${adminEmail}`);
      }
  } catch (error) {
    console.error('[Admin Init Error]', error.message);
  }
};

module.exports = {
  initAdminUser
};
