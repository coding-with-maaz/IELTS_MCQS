const SpeakingSection = require('../models/SpeakingSection');
const fs = require('fs').promises;
const path = require('path');

// Create a new speaking section
exports.createSpeakingSection = async (req, res) => {
  try {
    console.log('Request files:', req.files);
    console.log('Request body:', req.body);

    if (!req.body.sectionName || !req.body.partType || !req.body.instructions) {
      return res.status(400).json({ message: 'Missing required fields. Please provide sectionName, partType, and instructions.' });
    }

    const { audio, image, pdf } = req.files || {};

    if (!audio) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    console.log('Audio file received:', audio[0]);

    const section = new SpeakingSection({
      sectionName: req.body.sectionName,
      partType: req.body.partType,
      instructions: req.body.instructions,
      timeLimit: req.body.timeLimit || 2, // Default 2 minutes if not provided
      audioFile: audio ? {
        filename: audio[0].filename,
        path: audio[0].path.replace(/\\/g, '/'), // Normalize path separators
        mimetype: audio[0].mimetype
      } : undefined,
      pdf: pdf ? {
        filename: pdf[0].filename,
        path: pdf[0].path.replace(/\\/g, '/'), // Normalize path separators
        mimetype: pdf[0].mimetype
      } : undefined,
      image: image ? {
        filename: image[0].filename,
        path: image[0].path.replace(/\\/g, '/'), // Normalize path separators
        mimetype: image[0].mimetype
      } : undefined
    });

    console.log('Section object before save:', section);
    await section.save();
    
    res.status(201).json(section);
  } catch (error) {
    // Delete uploaded files if there's an error
    console.error('Full error object:', error);
    if (req.files) {
      try {
        if (req.files.audio && req.files.audio[0].path) {
          await fs.unlink(req.files.audio[0].path);
        }
        if (req.files.pdf && req.files.pdf[0].path) {
          await fs.unlink(req.files.pdf[0].path);
        }
        if (req.files.image && req.files.image[0].path) {
          await fs.unlink(req.files.image[0].path);
        }
      } catch (deleteError) {
        console.error('Error deleting files:', deleteError);
      }
    }
    console.error('Error creating section:', error.message);
    res.status(500).json({ message: error.message || 'Something went wrong!' });
  }
};

// Get all speaking sections
exports.getAllSpeakingSections = async (req, res) => {
  try {
    const sections = await SpeakingSection.find();
    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ message: error.message || 'Something went wrong!' });
  }
};

// Get a specific speaking section
exports.getSpeakingSection = async (req, res) => {
  try {
    const section = await SpeakingSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ message: error.message || 'Something went wrong!' });
  }
};

// Update a speaking section
exports.updateSpeakingSection = async (req, res) => {
  try {
    console.log('Update request files:', req.files);
    console.log('Update request body:', req.body);

    const section = await SpeakingSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const { audio, image, pdf } = req.files || {};

    // Update audio file if provided
    if (audio) {
      // Delete old file if it exists
      if (section.audioFile && section.audioFile.path) {
        try {
          const oldPath = path.resolve(section.audioFile.path);
          await fs.unlink(oldPath);
        } catch (error) {
          console.error('Error deleting old audio file:', error);
        }
      }
      
      section.audioFile = {
        filename: audio[0].filename,
        path: audio[0].path.replace(/\\/g, '/'), // Normalize path separators
        mimetype: audio[0].mimetype
      };
    }

    // Update image if provided
    if (image) {
      // Delete old file if it exists
      if (section.image && section.image.path) {
        try {
          const oldPath = path.resolve(section.image.path);
          await fs.unlink(oldPath);
        } catch (error) {
          console.error('Error deleting old image file:', error);
        }
      }
      
      section.image = {
        filename: image[0].filename,
        path: image[0].path.replace(/\\/g, '/'), // Normalize path separators
        mimetype: image[0].mimetype
      };
    }

    // Update PDF if provided
    if (pdf) {
      // Delete old file if it exists
      if (section.pdf && section.pdf.path) {
        try {
          const oldPath = path.resolve(section.pdf.path);
          await fs.unlink(oldPath);
        } catch (error) {
          console.error('Error deleting old PDF file:', error);
        }
      }
      
      section.pdf = {
        filename: pdf[0].filename,
        path: pdf[0].path.replace(/\\/g, '/'), // Normalize path separators
        mimetype: pdf[0].mimetype
      };
    }

    // Update other fields
    if (req.body.sectionName) {
      section.sectionName = req.body.sectionName;
    }
    if (req.body.partType) {
      section.partType = req.body.partType;
    }
    if (req.body.instructions) {
      section.instructions = req.body.instructions;
    }
    if (req.body.timeLimit) {
      section.timeLimit = req.body.timeLimit;
    }

    console.log('Section object before update save:', section);
    const updatedSection = await section.save();
    res.json(updatedSection);
  } catch (error) {
    // Delete newly uploaded files if there's an error
    console.error('Full update error object:', error);
    if (req.files) {
      try {
        if (req.files.audio && req.files.audio[0].path) {
          await fs.unlink(req.files.audio[0].path);
        }
        if (req.files.pdf && req.files.pdf[0].path) {
          await fs.unlink(req.files.pdf[0].path);
        }
        if (req.files.image && req.files.image[0].path) {
          await fs.unlink(req.files.image[0].path);
        }
      } catch (deleteError) {
        console.error('Error deleting files:', deleteError);
      }
    }
    console.error('Error updating section:', error.message);
    res.status(500).json({ message: error.message || 'Something went wrong!' });
  }
};

// Delete a speaking section
exports.deleteSpeakingSection = async (req, res) => {
  try {
    const section = await SpeakingSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Delete associated files
    if (section.audioFile && section.audioFile.path) {
      try {
        const audioPath = path.resolve(section.audioFile.path);
        await fs.unlink(audioPath);
      } catch (error) {
        console.error('Error deleting audio file:', error);
      }
    }
    
    if (section.image && section.image.path) {
      try {
        const imagePath = path.resolve(section.image.path);
        await fs.unlink(imagePath);
      } catch (error) {
        console.error('Error deleting image file:', error);
      }
    }
    
    if (section.pdf && section.pdf.path) {
      try {
        const pdfPath = path.resolve(section.pdf.path);
        await fs.unlink(pdfPath);
      } catch (error) {
        console.error('Error deleting PDF file:', error);
      }
    }

    await section.deleteOne();
    res.json({ message: 'Section and associated files deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ message: error.message || 'Something went wrong!' });
  }
};
