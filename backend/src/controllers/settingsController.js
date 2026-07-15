const Setting = require('../models/Setting');
const ActivityLog = require('../models/ActivityLog');

// GET /api/settings
const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings
const updateSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }

    const allowed = [
      'companyName', 'businessEmail', 'phone', 'website', 'address', 'taxId',
      'currency', 'timezone', 'language', 'appearanceTheme', 'compactMode',
      'businessHours', 'branding', 'booking', 'vehicles', 'payments',
      'notifications', 'promotions', 'security', 'backup', 'reports',
      'maintenanceMode', 'maintenanceMessage',
    ];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (key === 'businessHours' || key === 'branding') {
          if (typeof req.body[key] === 'object' && !Array.isArray(req.body[key])) {
            Object.assign(settings[key], req.body[key]);
          }
        } else if (['booking', 'vehicles', 'notifications', 'promotions', 'security', 'backup', 'reports'].includes(key)) {
          if (typeof req.body[key] === 'object' && !Array.isArray(req.body[key])) {
            if (key === 'payments' && req.body[key].methods) {
              Object.assign(settings.payments.methods, req.body[key].methods);
              delete req.body[key].methods;
            }
            Object.assign(settings[key], req.body[key]);
          }
        } else {
          settings[key] = req.body[key];
        }
      }
    }

    await settings.save();

    await ActivityLog.create({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'updated',
      resource: 'settings',
      details: 'System settings updated',
      ip: req.ip,
    });

    res.json(settings);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings };
