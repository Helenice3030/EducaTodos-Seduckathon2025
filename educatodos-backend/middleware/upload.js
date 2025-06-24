const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { errorResponse } = require('../utils/helpers');

// Configurar storage do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  },
});

// Filtro de tipos de arquivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'application/pdf': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true, // .docx
    'application/msword': true, // .doc
    'text/plain': true,
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Tipos aceitos: JPG, PNG, GIF, PDF, DOCX, DOC, TXT'), false);
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB por padrão
  },
});

// Middleware para tratar erros de upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(errorResponse('Arquivo muito grande. Tamanho máximo: 10MB'));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json(errorResponse('Muitos arquivos enviados'));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json(errorResponse('Campo de arquivo inesperado'));
    }
  }
  
  if (err.message.includes('Tipo de arquivo não permitido')) {
    return res.status(400).json(errorResponse(err.message));
  }
  
  return res.status(500).json(errorResponse('Erro no upload do arquivo'));
};

// Middleware para upload de arquivo único
const uploadSingle = (fieldName) => {
  return [
    upload.single(fieldName),
    handleUploadError,
  ];
};

// Middleware para upload de múltiplos arquivos
const uploadMultiple = (fieldName, maxCount = 5) => {
  return [
    upload.array(fieldName, maxCount),
    handleUploadError,
  ];
};

// Middleware para upload de campos múltiplos
const uploadFields = (fields) => {
  return [
    upload.fields(fields),
    handleUploadError,
  ];
};

// Função para deletar arquivo
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    return false;
  }
};

// Função para obter informações do arquivo
const getFileInfo = (file) => {
  if (!file) return null;
  
  return {
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    extension: path.extname(file.originalname),
  };
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  deleteFile,
  getFileInfo,
};

