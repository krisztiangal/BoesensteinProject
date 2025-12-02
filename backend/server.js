const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --------------------- File Paths ---------------------
const dataDirPath = path.join(__dirname, 'data');
const usersFilePath = path.join(dataDirPath, 'users.json');
const mountainsDataFilePath = path.join(dataDirPath, 'mountainData.js');

// ---------------------- Helper Functions --------------
const generateUniqueUserId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

const readMountains = () => {
  try {
    delete require.cache[require.resolve(mountainsDataFilePath)];
    return require(mountainsDataFilePath);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      return [];
    }
    console.error("Error reading mountain data:", error);
    throw error;
  }
};

const generateUniqueMountainId = () => {
  const mountains = readMountains();
  let maxId = 0;

  if (mountains && mountains.length > 0) {
    mountains.forEach(mountain => {
      const currentId = parseInt(mountain.id, 10);
      if (!isNaN(currentId) && currentId > maxId) {
        maxId = currentId;
      }
    });
  }

  return maxId + 1;
};

const readJsonFile = async (filePath) => {
  try {
    const fileContent = await fsp.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error(`Error reading data from ${filePath}:`, error);
    throw error;
  }
};

const writeJsonFile = async (filePath, data) => {
  try {
    await fsp.mkdir(path.dirname(filePath), { recursive: true });
    await fsp.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing data to ${filePath}:`, error);
    throw error;
  }
};

const readUsers = async () => readJsonFile(usersFilePath);
const writeUsers = async (users) => writeJsonFile(usersFilePath, users);

const writeMountains = async (mountains) => {
  try {
    const fileContent = `module.exports = ${JSON.stringify(mountains, null, 2)};`;
    await fsp.writeFile(mountainsDataFilePath, fileContent, 'utf8');
  } catch (error) {
    console.error("Error writing mountain data:", error);
    throw error;
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// ------------------------------ Middleware -----------------------------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/*const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',

];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  }));*/
  app.use(cors());  // Default CORS with all origins allowed

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- Multer Configurations ---
const mountainStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads', 'mountains');
    await fsp.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `temp-${uniqueSuffix}-${file.originalname}`);
  },
});

const pfpStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads', 'pfp');
    await fsp.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const username = req.body.username || req.params.username;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${username}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const uploadMountainImages = multer({ storage: mountainStorage });
const uploadPfp = multer({
  storage: pfpStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// --- Authentication Middleware ---
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await readUsers();
    req.user = users.find(u => u._id === decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });
    }
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

const adminProtect = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized as an admin'
    });
  }
  next();
};

// ------------------------------ API Endpoints -----------------------------------------

// -------------------------- AUTHENTICATION ROUTES ---------------------------

app.post('/api/auth/signup', uploadPfp.single('pfp'), async (req, res) => {
  const { username, password, nickname } = req.body;
  const pfpUrl = req.file ? `uploads/pfp/${req.file.filename}` : null;

  if (!username || !password) {
    if (req.file) await fsp.unlink(req.file.path).catch(console.error);
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  try {
    const users = await readUsers();
    if (users.some(u => u.username === username)) {
      if (req.file) await fsp.unlink(req.file.path).catch(console.error);
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: generateUniqueUserId(),
      username,
      nickname: nickname || username,
      hashedPassword,
      role: 'user',
      wishlist: [],
      summited: [],
      uploadedMountains: [],
      pfp: pfpUrl,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeUsers(users);

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      data: {
        _id: newUser._id,
        username: newUser.username,
        nickname: newUser.nickname,
        pfp: newUser.pfp,
        role: newUser.role,
        token
      },
      message: 'User registered successfully!'
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (req.file) await fsp.unlink(req.file.path).catch(console.error);
    res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
});
// ------------------- LOGIN ---------------------------
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  try {
    const users = await readUsers();
    const user = users.find(u => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.hashedPassword))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        nickname: user.nickname,
        pfp: user.pfp,
        role: user.role,
        wishlist: user.wishlist || [],
        summited: user.summited || [],
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
});

app.get('/api/auth/me', protect, async (req, res) => {
  res.json({
    success: true,
    data: {
      _id: req.user._id,
      username: req.user.username,
      nickname: req.user.nickname,
      pfp: req.user.pfp,
      role: req.user.role,
      wishlist: req.user.wishlist || [],
      summited: req.user.summited || [],
    }
  });
});

// ------------------- USER PROFILE ROUTES ---------------------------
app.get('/api/users/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const users = await readUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const allMountains = readMountains();

    const populatedWishlist = user.wishlist?.map(mountainId =>
      allMountains.find(m => m.id === mountainId)
    ).filter(Boolean) || [];

    const populatedSummited = user.summited?.map(mountainId =>
      allMountains.find(m => m.id === mountainId)
    ).filter(Boolean) || [];

    const publicProfile = {
      _id: user._id,
      username: user.username,
      nickname: user.nickname,
      pfp: user.pfp,
      summited_mountains: populatedSummited,
      wishlist_mountains: populatedWishlist,
      bio: user.bio || '',
    };

    res.status(200).json({ success: true, data: publicProfile });

  } catch (error) {
    console.error(`Error fetching public profile for ${username}:`, error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

app.post('/api/users/:username/pfp', protect, uploadPfp.single('pfp'), async (req, res) => {
  const { username } = req.params;
  const pfpUrl = req.file ? `uploads/pfp/${req.file.filename}` : null;

  if (req.user.username !== username) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this user\'s profile picture.' });
  }

  if (!pfpUrl) {
    return res.status(400).json({ success: false, message: 'No profile picture file provided.' });
  }

  try {
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[userIndex];

    // Delete old profile picture if it exists
    if (user.pfp) {
      const oldPfpPath = path.join(__dirname, user.pfp);
      if (fs.existsSync(oldPfpPath)) {
        await fsp.unlink(oldPfpPath).catch(err => console.error('Error deleting old PFP:', err));
      }
    }

    user.pfp = pfpUrl;
    await writeUsers(users);

    res.json({
      success: true,
      data: { pfpUrl },
      message: 'Profile picture updated successfully.'
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ success: false, message: 'Server error while updating profile picture.' });
  }
});

// ---------------------------- MOUNTAIN ROUTES -----------------------------
app.get('/api/mountains', async (req, res) => {
  try {
    const mountains = readMountains();
    res.json({ success: true, data: mountains });
  } catch (error) {
    console.error('Error serving mountain data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/mountains', protect, uploadMountainImages.array('images', 5), async (req, res) => {
  const { name, height, country, needsEquipment, description } = req.body;
  const uploadedBy = req.user.username;
  const imageFiles = req.files;

  if (!imageFiles || imageFiles.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one image is required.'
    });
  }

  if (!name || !height || !country || needsEquipment === undefined) {
    if (imageFiles) {
      await Promise.all(imageFiles.map(file =>
        fsp.unlink(file.path).catch(console.error)
      ));
    }
    return res.status(400).json({
      success: false,
      message: 'All mountain fields are required.'
    });
  }

  try {
    const mountains = readMountains();
    const newMountainId = generateUniqueMountainId();

    const newMountain = {
      id: newMountainId,
      name: name.trim(),
      height: parseInt(height, 10),
      country: country.trim(),
      needsEquipment: needsEquipment === 'true' || needsEquipment === true,
      description: (description || '').trim(),
      images: [],
      uploadedBy,
      createdAt: new Date().toISOString()
    };

    const finalImageUrls = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileExtension = path.extname(file.originalname);
      const newFilename = `${newMountainId}_${i + 1}${fileExtension}`;
      const newRelativePath = `uploads/mountains/${newFilename}`;

      const uploadsDir = path.join(__dirname, 'uploads', 'mountains');
      await fsp.mkdir(uploadsDir, { recursive: true });

      const newAbsolutePath = path.join(uploadsDir, newFilename);
      await fsp.rename(file.path, newAbsolutePath);
      finalImageUrls.push(newRelativePath);
    }

    newMountain.images = finalImageUrls;
    mountains.push(newMountain);
    await writeMountains(mountains);

    const users = await readUsers();
    const userIndex = users.findIndex(u => u.username === uploadedBy);
    if (userIndex !== -1) {
      if (!users[userIndex].uploadedMountains) {
        users[userIndex].uploadedMountains = [];
      }
      users[userIndex].uploadedMountains.push(newMountainId);
      await writeUsers(users);
    }

    res.status(201).json({
      success: true,
      data: newMountain,
      message: 'Mountain uploaded successfully!'
    });

  } catch (error) {
    console.error('Error uploading mountain:', error);
    if (imageFiles) {
      await Promise.all(imageFiles.map(file =>
        fsp.unlink(file.path).catch(console.error)
      ));
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error during upload.'
    });
  }
});
// ------------------------------- DELETE MOUNTAIN ---------------------------
app.delete('/api/mountains/:id', protect, adminProtect, async (req, res) => {
  try {
    const mountainId = parseInt(req.params.id, 10);
    const mountains = readMountains();
    const mountainToDelete = mountains.find(m => m.id === mountainId);

    if (!mountainToDelete) {
      return res.status(404).json({ success: false, message: 'Mountain not found.' });
    }

    if (mountainToDelete.uploadedBy !== req.user.username && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this mountain.' });
    }

    if (mountainToDelete.images && mountainToDelete.images.length > 0) {
      for (const imageUrl of mountainToDelete.images) {
        const imagePath = path.join(__dirname, imageUrl);
        if (fs.existsSync(imagePath)) {
          await fsp.unlink(imagePath).catch(console.error);
        }
      }
    }

    const updatedMountains = mountains.filter(m => m.id !== mountainToDelete.id);
    await writeMountains(updatedMountains);

    res.json({ success: true, message: 'Mountain deleted successfully.' });

  } catch (error) {
    console.error('Error deleting mountain:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});
// ----------------------- Mountain images routes -------------------------------------
app.patch('/api/mountains/:id/images', protect, uploadMountainImages.array('images', 5), async (req, res) => {
  const mountainId = parseInt(req.params.id, 10);

  console.log(`📤 Adding images to mountain ${mountainId}`);
  console.log('Files received:', req.files ? req.files.length : 0);

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No image files provided.' });
  }

  try {
    const mountains = readMountains(); // This is synchronous in your server
    const mountainIndex = mountains.findIndex(m => m.id === mountainId);

    if (mountainIndex === -1) {
      return res.status(404).json({ success: false, message: 'Mountain not found.' });
    }

    const mountain = mountains[mountainIndex];

    // Check authorization
    if (req.user.username !== mountain.uploadedBy && req.user.role !== 'admin') {
      // Clean up uploaded files
      await Promise.all(req.files.map(file =>
        fsp.unlink(file.path).catch(err =>
          console.error('Error deleting unauthorized image upload:', err)
        )
      ));
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add images to this mountain.'
      });
    }

    const newImageUrls = [];

    // Process each new image
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const fileExtension = path.extname(file.originalname);
      const newFilename = `${mountainId}_${mountain.images.length + i + 1}${fileExtension}`;
      const newRelativePath = `uploads/mountains/${newFilename}`;

      const uploadsDir = path.join(__dirname, 'uploads', 'mountains');
      await fsp.mkdir(uploadsDir, { recursive: true });

      const newAbsolutePath = path.join(uploadsDir, newFilename);
      await fsp.rename(file.path, newAbsolutePath);
      newImageUrls.push(newRelativePath);
    }

    // Update the mountain with new images
    mountain.images = [...mountain.images, ...newImageUrls];
    await writeMountains(mountains);

    console.log(`✅ Added ${newImageUrls.length} images to mountain ${mountainId}`);

    res.json({
      success: true,
      data: {
        newImageUrls,
        totalImages: mountain.images.length
      },
      message: 'Images added successfully!'
    });

  } catch (error) {
    console.error('❌ Error adding images to mountain:', error);

    // Clean up any uploaded files on error
    if (req.files) {
      await Promise.all(req.files.map(file =>
        fsp.unlink(file.path).catch(err =>
          console.error('Error deleting uploaded file on error:', err)
        )
      ));
    }

    res.status(500).json({
      success: false,
      message: 'An internal server error occurred while adding images.'
    });
  }
});
// --------- admin deleting picture
// --- ADMIN: Delete a picture from a mountain ---
app.delete('/api/admin/mountains/:mountainId/pictures', protect, adminProtect, async (req, res) => {
  const mountainId = parseInt(req.params.mountainId, 10);
  const { imageUrl } = req.body;

  if (isNaN(mountainId) || !imageUrl) {
    return res.status(400).json({ success: false, message: 'Invalid Mountain ID or Image URL is missing.' });
  }

  try {
    const mountains = readMountains();
    const mountainIndex = mountains.findIndex(m => m.id === mountainId);

    if (mountainIndex === -1) {
      return res.status(404).json({ success: false, message: 'Mountain not found.' });
    }

    const mountain = mountains[mountainIndex];
    const initialImageCount = mountain.images.length;

    // Check authorization
    if (req.user.username !== mountain.uploadedBy && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete images from this mountain.'
      });
    }

    // Filter out the image to delete
    mountain.images = mountain.images.filter(img => img !== imageUrl);

    if (mountain.images.length < initialImageCount) {
      // Save updated mountains
      await writeMountains(mountains);

      // Delete the actual file
      const imagePath = path.join(__dirname, imageUrl);
      if (fs.existsSync(imagePath)) {
        await fsp.unlink(imagePath).catch(err =>
          console.error(`Error deleting picture file ${imagePath}:`, err)
        );
      }

      res.json({
        success: true,
        message: 'Picture deleted successfully.',
        data: mountain.images
      });
    } else {
      return res.status(404).json({
        success: false,
        data: mountain.images,
        message: 'Picture not found for this mountain.'
      });
    }

  } catch (error) {
    console.error('Error deleting mountain picture:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// ------------------------- RANKING ROUTES -----------------------
app.get('/api/ranks/highest-point', async (req, res) => {
  try {
    const users = await readUsers();
    const mountains = readMountains();

    const usersWithHighestPoint = users.map(user => {
      let highestPoint = 0;
      user.summited.forEach(mountainId => {
        const mountain = mountains.find(m => m.id === mountainId);
        if (mountain && mountain.height > highestPoint) {
          highestPoint = mountain.height;
        }
      });
      return {
        username: user.username,
        nickname: user.nickname,
        pfp: user.pfp,
        highestPoint: highestPoint,
      };
    }).sort((a, b) => b.highestPoint - a.highestPoint);

    res.json({ success: true, data: usersWithHighestPoint });

  } catch (error) {
    console.error('Error fetching highest point ranks:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching highest point ranks.' });
  }
});
// ---------------------------- count summited --------------------------
app.get('/api/ranks/summited-count', async (req, res) => {
  try {
    const users = await readUsers();

    const usersWithSummitedCount = users.map(user => ({
      username: user.username,
      nickname: user.nickname,
      pfp: user.pfp,
      summitedCount: user.summited.length,
    })).sort((a, b) => b.summitedCount - a.summitedCount);

    res.json({ success: true, data: usersWithSummitedCount });

  } catch (error) {
    console.error('Error fetching summited count ranks:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching summited count ranks.' });
  }
});

// ---------------------------------- SEARCH ROUTES ---------------------------
app.get('/api/search', async (req, res) => {
  const query = req.query.q ? req.query.q.toLowerCase() : '';

  if (!query) {
    return res.status(400).json({ success: false, message: 'Search query is required.' });
  }

  try {
    const allMountains = readMountains();
    const allUsers = await readUsers();

    const matchingMountains = allMountains.filter(mountain =>
      mountain.name.toLowerCase().includes(query) ||
      mountain.country.toLowerCase().includes(query)
    );

    const matchingUsers = allUsers.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.nickname.toLowerCase().includes(query)
    ).map(user => ({
      _id: user._id,
      username: user.username,
      nickname: user.nickname,
      pfp: user.pfp,
    }));

    res.json({
      success: true,
      data: {
        mountains: matchingMountains,
        users: matchingUsers,
      },
    });

  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).json({ success: false, message: 'Server error during search.' });
  }
});

// --------------------- WISHLIST ROUTES ---------------------------
app.post('/api/users/wishlist', protect, async (req, res) => {
  const { mountainId } = req.body;

  if (!mountainId) {
    return res.status(400).json({ success: false, message: 'Mountain ID is required.' });
  }

  try {
    const users = await readUsers();
    const userIndex = users.findIndex(u => u._id === req.user._id);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[userIndex];
    if (!user.wishlist) user.wishlist = [];

    const numericMountainId = parseInt(mountainId, 10);

    if (user.wishlist.includes(numericMountainId)) {
      return res.status(400).json({
        success: false,
        message: 'Mountain already in wishlist.',
        data: user.wishlist
      });
    }

    user.wishlist.push(numericMountainId);
    await writeUsers(users);

    res.json({
      success: true,
      data: user.wishlist,
      message: 'Mountain added to wishlist successfully.'
    });

  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});
// -------------------------- delete from wishlist ---------------------------
app.delete('/api/users/wishlist/:mountainId', protect, async (req, res) => {
  const mountainId = parseInt(req.params.mountainId, 10);

  if (isNaN(mountainId)) {
    return res.status(400).json({ success: false, message: 'Invalid Mountain ID.' });
  }

  try {
    const users = await readUsers();
    const userIndex = users.findIndex(u => u._id === req.user._id);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[userIndex];
    if (!user.wishlist) user.wishlist = [];

    const initialLength = user.wishlist.length;
    user.wishlist = user.wishlist.filter(id => id !== mountainId);

    if (user.wishlist.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Mountain not found in wishlist.',
        data: user.wishlist
      });
    }

    await writeUsers(users);

    res.json({
      success: true,
      data: user.wishlist,
      message: 'Mountain removed from wishlist successfully.'
    });

  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ------------------------------- SUMMITED ROUTES ------------------------------
app.post('/api/users/summited', protect, async (req, res) => {
  const { mountainId } = req.body;

  if (!mountainId) {
    return res.status(400).json({ success: false, message: 'Mountain ID is required.' });
  }

  try {
    const users = await readUsers();
    const userIndex = users.findIndex(u => u._id === req.user._id);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[userIndex];
    if (!user.summited) user.summited = [];

    const numericMountainId = parseInt(mountainId, 10);

    if (user.summited.includes(numericMountainId)) {
      return res.status(400).json({
        success: false,
        message: 'Mountain already marked as summited.',
        data: user.summited
      });
    }

    user.summited.push(numericMountainId);
    await writeUsers(users);

    res.json({
      success: true,
      data: user.summited,
      message: 'Mountain marked as summited successfully.'
    });

  } catch (error) {
    console.error('Error marking as summited:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ------------------------------- delete from summited ------------------------------
app.delete('/api/users/summited/:mountainId', protect, async (req, res) => {
  const mountainId = parseInt(req.params.mountainId, 10);

  if (isNaN(mountainId)) {
    return res.status(400).json({ success: false, message: 'Invalid Mountain ID.' });
  }

  try {
    const users = await readUsers();
    const userIndex = users.findIndex(u => u._id === req.user._id);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[userIndex];
    if (!user.summited) user.summited = [];

    const initialLength = user.summited.length;
    user.summited = user.summited.filter(id => id !== mountainId);

    if (user.summited.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Mountain not found in summited list.',
        data: user.summited
      });
    }

    await writeUsers(users);

    res.json({
      success: true,
      data: user.summited,
      message: 'Mountain unmarked as summited successfully.'
    });

  } catch (error) {
    console.error('Error unmarking summited:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
});
