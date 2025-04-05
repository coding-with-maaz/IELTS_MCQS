const Section = require('../models/Section');
const path = require('path');

exports.createSection = async (req, res) => {
  try {
    // Get the uploaded files
    const audio = req.files?.audio ? req.files.audio[0].path : null;
    const image = req.files?.image ? req.files.image[0].path : null;
    const pdf = req.files?.pdf ? req.files.pdf[0].path : null;

    // Parse questions if sent as a JSON string
    let questions = [];
    if (req.body.questions) {
      try {
        questions = JSON.parse(req.body.questions);
      } catch (parseError) {
        console.error("Error parsing questions:", parseError);
        return res.status(400).json({ 
          success: false, 
          message: "Invalid questions format" 
        });
      }
    }

    const section = new Section({
      sectionName: req.body.sectionName,
      description: req.body.description,
      audio: audio,
      image: image,
      pdf: pdf,
      questions: questions,
    });

    await section.save();
    
    // Populate questions before sending response
    const populatedSection = await Section.findById(section._id).populate('questions');
    
    res.status(201).json({
      success: true,
      data: populatedSection,
      message: "Section created successfully"
    });
  } catch (error) {
    console.error("Error creating section:", error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getAllSections = async (req, res) => {
  try {
    const sections = await Section.find().populate('questions');
    res.json({
      success: true,
      data: sections
    });
  } catch (error) {
    console.error("Error getting sections:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id).populate('questions');
    if (!section) {
      return res.status(404).json({ 
        success: false, 
        message: 'Section not found' 
      });
    }
    res.json({
      success: true,
      data: section
    });
  } catch (error) {
    console.error("Error getting section:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    // Get the uploaded files (audio, image, pdf), if any
    const audio = req.files?.audio ? req.files.audio[0].path : null;
    const image = req.files?.image ? req.files.image[0].path : null;
    const pdf = req.files?.pdf ? req.files.pdf[0].path : null;

    // Parse questions if sent as a JSON string
    let questions = undefined;
    if (req.body.questions) {
      try {
        questions = JSON.parse(req.body.questions);
      } catch (parseError) {
        console.error("Error parsing questions:", parseError);
        return res.status(400).json({ 
          success: false, 
          message: "Invalid questions format" 
        });
      }
    }

    // Get the existing section from the database
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ 
        success: false, 
        message: 'Section not found' 
      });
    }

    // Only update the fields that are provided in the request body or file uploads
    if (audio) {
      section.audio = audio;
    }
    if (image) {
      section.image = image;
    }
    if (pdf) {
      section.pdf = pdf;
    }

    // Update other fields that might have been modified
    section.sectionName = req.body.sectionName || section.sectionName;
    section.description = req.body.description || section.description;
    if (questions) {
      section.questions = questions;
    }

    // Save the updated section
    await section.save();

    // Populate questions before sending response
    const populatedSection = await Section.findById(section._id).populate('questions');

    // Respond with the updated section
    res.json({
      success: true,
      data: populatedSection,
      message: "Section updated successfully"
    });
  } catch (error) {
    console.error("Error updating section:", error);
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findByIdAndDelete(req.params.id);
    if (!section) {
      return res.status(404).json({ 
        success: false, 
        message: 'Section not found' 
      });
    }
    res.status(200).json({
      success: true,
      message: "Section deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
