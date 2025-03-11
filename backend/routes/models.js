const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const Model = require('../models/Model');


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  }
});


const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['.stl', '.obj'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only STL and OBJ files are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

router.post('/', auth, upload.single('model'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { originalname, filename, path: filepath, size } = req.file;
    const filetype = path.extname(originalname).slice(1).toLowerCase();

    const newModel = new Model({
      user: req.user.id,
      name: originalname,
      filename,
      filepath,
      filesize: size / (1024 * 1024),
      filetype
    });

    const model = await newModel.save();
    res.json(model);
  } catch (err) {
    console.error(err);
    if (err.message === 'Only STL and OBJ files are allowed!') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error during upload' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const models = await Model.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(models);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving models' });
  }
});


router.get('/:id', auth, async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }

    if (model.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    model.views += 1;
    await model.save();

    res.json(model);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Model not found' });
    }
    res.status(500).json({ message: 'Server error retrieving model' });
  }
});


router.get('/file/:id', auth, async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }


    if (model.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }


    model.downloads += 1;
    await model.save();

    res.download(model.filepath, model.name);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Model not found' });
    }
    res.status(500).json({ message: 'Server error downloading file' });
  }
});


router.delete('/:id', auth, async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }
    

    if (model.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    fs.unlink(model.filepath, async (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
      
      await Model.findByIdAndDelete(req.params.id);
      res.json({ message: 'Model removed' });
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Model not found' });
    }
    res.status(500).json({ message: 'Server error deleting model' });
  }
});

module.exports = router;