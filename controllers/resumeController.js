const Resume = require("./../models/resumeModel");
const User = require("./../models/userModel");
const Jobseeker = require("./../models/jobseekerModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const {
  validateMongoDbId,
  queryHelper,
  handleUploadImage,
} = require("./../utils/index");

const createResume = async (req, res) => {
  const { userId } = req.user;
  validateMongoDbId(userId);
  const {
    personalDetails,
    education,
    workExperience,
    skills,
    projects,
    certifications,
  } = req.body;
  const existingJobseeker = await User.findById({ _id: userId });
  if (!existingJobseeker) {
    throw new CustomError.NotFoundError(
      `Not found user with this ID: ${userId}`
    );
  }
  const jobseeker = await Jobseeker.findOne({ user: existingJobseeker._id });
  if (!jobseeker) {
    throw new CustomError.NotFoundError(
      `Not found jobseeker with this ID: ${existingJobseeker._id}`
    );
  }

  const resume = await Resume.create({
    jobseeker: jobseeker._id,
    personalDetails,
    education,
    workExperience,
    skills,
    projects,
    certifications,
  });

  res.status(StatusCodes.CREATED).json({ resume });
};

const getAllResumes = async (req, res) => {
  const { userId } = req.user;
  validateMongoDbId(userId);
  const existingJobseeker = await User.findById({ _id: userId });
  if (!existingJobseeker) {
    throw new CustomError.NotFoundError(
      `Not found user with this ID: ${userId}`
    );
  }
  const jobseeker = await Jobseeker.findOne({ user: existingJobseeker._id });
  if (!jobseeker) {
    throw new CustomError.NotFoundError(
      `Not found jobseeker with this ID: ${existingJobseeker._id}`
    );
  }

  const page = req.query.page || 1;
  const limit = req.query.limit || 6;
  const skip = (page - 1) * limit;

  const resumes = await Resume.find({
    jobseeker: jobseeker._id,
  }).select("-_id -jobseeker");

  if (skip >= resumes.length) {
    throw new CustomError.NotFoundError("The page does not exist");
  }
  const totalPages = Math.ceil(resumes.length / limit);

  res
    .status(StatusCodes.OK)
    .json({ resumes, count: resumes.length, totalPages });
};

const getSingleResume = async (req, res) => {
  const { userId } = req.user;
  validateMongoDbId(userId);
  const { resumeId } = req.params;
  validateMongoDbId(resumeId);

  const existingJobseeker = await User.findById({ _id: userId });
  if (!existingJobseeker) {
    throw new CustomError.NotFoundError(
      `Not found user with this ID: ${userId}`
    );
  }
  const jobseeker = await Jobseeker.findOne({ user: existingJobseeker._id });
  if (!jobseeker) {
    throw new CustomError.NotFoundError(
      `Not found jobseeker with this ID: ${existingJobseeker._id}`
    );
  }

  const resume = await Resume.findById({ _id: resumeId }).select("-_id");
  if (!resume) {
    throw new CustomError.NotFoundError(
      `Not found resume with this ID: ${resumeId}`
    );
  }
  res.status(StatusCodes.OK).json({ resume });
};

const updateResume = async (req, res) => {
  const { userId } = req.user;
  validateMongoDbId(userId);
  const { resumeId } = req.params;
  validateMongoDbId(resumeId);
  const {
    personalDetails,
    education,
    workExperience,
    skills,
    projects,
    certifications,
  } = req.body;

  const existingJobseeker = await User.findById({ _id: userId });
  if (!existingJobseeker) {
    throw new CustomError.NotFoundError(
      `Not found user with this ID: ${userId}`
    );
  }
  const jobseeker = await Jobseeker.findOne({ user: existingJobseeker._id });
  if (!jobseeker) {
    throw new CustomError.NotFoundError(
      `Not found jobseeker with this ID: ${existingJobseeker._id}`
    );
  }

  const resume = await Resume.findByIdAndUpdate(
    {
      _id: resumeId,
    },
    {
      personalDetails,
      education,
      workExperience,
      skills,
      projects,
      certifications,
    },
    {
      new: true,
    }
  );

  if (!resume) {
    throw new CustomError.NotFoundError(
      `Not found resume with this ID: ${resumeId}`
    );
  }
  res.status(StatusCodes.OK).json({ resume });
};

const uploadAvatar = async (req, res) => {
  await handleUploadImage(req, res, "resumeAvatar", Resume);
};

const deleteResume = async (req, res) => {
  const { userId } = req.user;
  validateMongoDbId(userId);
  const { resumeId } = req.params;
  validateMongoDbId(resumeId);

  const existingJobseeker = await User.findById({ _id: userId });
  if (!existingJobseeker) {
    throw new CustomError.NotFoundError(
      `Not found user with this ID: ${userId}`
    );
  }
  const jobseeker = await Jobseeker.findOne({ user: existingJobseeker._id });
  if (!jobseeker) {
    throw new CustomError.NotFoundError(
      `Not found jobseeker with this ID: ${existingJobseeker._id}`
    );
  }

  const resume = await Resume.findByIdAndDelete({ _id: resumeId });
  if (!resume) {
    throw new CustomError.NotFoundError(
      `Not found resume with this ID: ${resumeId}`
    );
  }
  res.status(StatusCodes.NO_CONTENT).json({ resume });
};

const generateResumePDF = async (req, res) => {
  try {
    const { userId } = req.user;
    validateMongoDbId(userId);
    const { resumeId } = req.params;
    validateMongoDbId(resumeId);

    const existingJobseeker = await User.findById({ _id: userId });
    if (!existingJobseeker) {
      throw new CustomError.NotFoundError(
        `Not found user with this ID: ${userId}`
      );
    }
    const jobseeker = await Jobseeker.findOne({ user: existingJobseeker._id });
    if (!jobseeker) {
      throw new CustomError.NotFoundError(
        `Not found jobseeker with this ID: ${existingJobseeker._id}`
      );
    }

    const resume = await Resume.findById({ _id: resumeId });
    if (!resume) {
      throw new CustomError.NotFoundError(
        `Not found resume with this ID: ${resumeId}`
      );
    }

    const doc = new PDFDocument();
    const filePath = path.join(
      __dirname,
      `./../public/resumePDF/${resume._id}.pdf`
    );
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Đường dẫn tương đối để lưu vào DB (bỏ phần /public đi)
    const relativePath = filePath.replace(
      path.join(__dirname, `./../public`),
      ""
    );

    // Update đường dẫn file PDF vào database
    await Resume.findByIdAndUpdate(
      { _id: resumeId },
      { stringUrl: relativePath }, // Lưu đường dẫn để client có thể tải file về
      { new: true }
    );

    const fontPath = path.join(__dirname, "./../public/fonts/DejaVuSans.ttf");
    doc.font(fontPath);

    doc
      .fontSize(25)
      .text(`Resume of ${resume.personalDetails.fullname}`, { align: "center" })
      .moveDown();

    doc
      .fontSize(18)
      .text("Personal Details:", { underline: true })
      .moveDown()
      .fontSize(12)
      .text(`Fullname: ${resume.personalDetails.fullname}`)
      .text(`Email: ${resume.personalDetails.email}`)
      .text(`Phone: ${resume.personalDetails.phone}`)
      .text(`Address: ${resume.personalDetails.address}`)
      .moveDown();

    doc.fontSize(18).text("Education:", { underline: true }).moveDown();
    resume.education.forEach((edu) => {
      doc
        .fontSize(12)
        .text(`School: ${edu.school}`)
        .text(`Degree: ${edu.degree}`)
        .text(
          `From: ${edu.startDate.toDateString()} To: ${edu.endDate.toDateString()}`
        )
        .moveDown();
    });

    doc.fontSize(18).text("Work Experience:", { underline: true }).moveDown();
    resume.workExperience.forEach((exp) => {
      doc
        .fontSize(12)
        .text(`Company: ${exp.company}`)
        .text(`Position: ${exp.position}`)
        .text(
          `From: ${exp.startDate.toDateString()} To: ${exp.endDate.toDateString()}`
        )
        .text(`Description: ${exp.description}`)
        .moveDown();
    });

    doc.fontSize(18).text("Skills:", { underline: true }).moveDown();
    doc.fontSize(12).text(resume.skills.join(", ")).moveDown();

    doc.fontSize(18).text("Projects:", { underline: true }).moveDown();
    resume.projects.forEach((project) => {
      doc
        .fontSize(12)
        .text(`Title: ${project.title}`)
        .text(`Description: ${project.description}`)
        .text(`Link: ${project.link}`)
        .moveDown();
    });

    doc.fontSize(18).text("Certifications:", { underline: true }).moveDown();
    resume.certifications.forEach((cert) => {
      doc
        .fontSize(12)
        .text(`Name: ${cert.name}`)
        .text(`Organization: ${cert.organization}`)
        .text(`Issue Date: ${cert.issueDate.toDateString()}`)
        .moveDown();
    });

    doc.end();

    writeStream.on("finish", () => {
      const downloadUrl = `${req.protocol}://${req.get("host")}${relativePath}`;
      res.status(200).json({
        message: "PDF generated successfully",
        downloadUrl: downloadUrl, // URL để tải file
      });
    });

    writeStream.on("error", (err) => {
      console.error("Error writing PDF file:", err);
      res.status(500).json({ message: "Error generating PDF" });
    });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to generate PDF" });
  }
};

module.exports = {
  createResume,
  getAllResumes,
  getSingleResume,
  updateResume,
  deleteResume,
  uploadAvatar,
  generateResumePDF,
};
