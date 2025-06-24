const { successResponse, errorResponse } = require('../utils/helpers');
const { Teacher, Disciplina, Conteudo, Material } = require('../models');
const { getFileInfo, deleteFile } = require('../middleware/upload');
const { Op } = require('sequelize');

/**
 * Listar materiais de um conteúdo
 */
const listMaterials = async (req, res) => {
  try {
    const { conteudo_id } = req.params;
    const { disability_type } = req.query;
    const userId = req.user.id;

    // Verificar se o professor tem acesso ao conteúdo
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const conteudo = await Conteudo.findOne({
      where: { id: conteudo_id },
      include: [
        {
          model: Disciplina,
          as: 'disciplina',
          where: { teacher_id: teacher.id },
        },
      ],
    });

    if (!conteudo) {
      return res.status(404).json(errorResponse('Conteúdo não encontrado ou você não tem permissão para acessá-lo'));
    }

    // Construir filtros
    const where = { conteudo_id };
    
    if (disability_type) {
      where[Op.or] = [
        { disability_type },
        { disability_type: 'all' },
      ];
    }

    const materials = await Material.findAll({
      where,
      order: [['created_at', 'DESC']],
    });

    res.json(successResponse(materials, 'Materiais listados com sucesso'));

  } catch (error) {
    console.error('Erro ao listar materiais:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Obter um material específico
 */
const getMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se o professor tem acesso ao material
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const material = await Material.findOne({
      where: { id },
      include: [
        {
          model: Conteudo,
          as: 'conteudo',
          include: [
            {
              model: Disciplina,
              as: 'disciplina',
              where: { teacher_id: teacher.id },
            },
          ],
        },
      ],
    });

    if (!material) {
      return res.status(404).json(errorResponse('Material não encontrado ou você não tem permissão para acessá-lo'));
    }

    res.json(successResponse(material, 'Material obtido com sucesso'));

  } catch (error) {
    console.error('Erro ao obter material:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Criar novo material
 */
const createMaterial = async (req, res) => {
  try {
    const { conteudo_id, title, description, type, content, disability_type } = req.body;
    const userId = req.user.id;

    // Verificar se o professor tem acesso ao conteúdo
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const conteudo = await Conteudo.findOne({
      where: { id: conteudo_id },
      include: [
        {
          model: Disciplina,
          as: 'disciplina',
          where: { teacher_id: teacher.id },
        },
      ],
    });

    if (!conteudo) {
      return res.status(404).json(errorResponse('Conteúdo não encontrado ou você não tem permissão para acessá-lo'));
    }

    let materialContent = content;
    let filePath = null;

    // Se é upload de arquivo
    if (type === 'file' && req.file) {
      const fileInfo = getFileInfo(req.file);
      filePath = fileInfo.path;
      materialContent = fileInfo.originalName; // Nome original do arquivo
    }

    // Validar conteúdo baseado no tipo
    if (type === 'link' && !materialContent.startsWith('http')) {
      return res.status(400).json(errorResponse('Link deve começar com http:// ou https://'));
    }

    if (type === 'youtube') {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
      if (!youtubeRegex.test(materialContent)) {
        return res.status(400).json(errorResponse('URL do YouTube inválida'));
      }
    }

    // Criar material
    const material = await Material.create({
      conteudo_id,
      title,
      description,
      type,
      content: materialContent,
      file_path: filePath,
      disability_type: disability_type || 'all',
    });

    res.status(201).json(successResponse(material, 'Material criado com sucesso'));

  } catch (error) {
    console.error('Erro ao criar material:', error);
    
    // Deletar arquivo se houve erro
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Atualizar material
 */
const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, content, disability_type, is_active } = req.body;
    const userId = req.user.id;

    // Verificar se o professor tem acesso ao material
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const material = await Material.findOne({
      where: { id },
      include: [
        {
          model: Conteudo,
          as: 'conteudo',
          include: [
            {
              model: Disciplina,
              as: 'disciplina',
              where: { teacher_id: teacher.id },
            },
          ],
        },
      ],
    });

    if (!material) {
      return res.status(404).json(errorResponse('Material não encontrado ou você não tem permissão para acessá-lo'));
    }

    let materialContent = content || material.content;
    let filePath = material.file_path;

    // Se é upload de novo arquivo
    if (type === 'file' && req.file) {
      // Deletar arquivo anterior se existir
      if (material.file_path) {
        deleteFile(material.file_path);
      }

      const fileInfo = getFileInfo(req.file);
      filePath = fileInfo.path;
      materialContent = fileInfo.originalName;
    }

    // Validar conteúdo baseado no tipo
    if (type === 'link' && materialContent && !materialContent.startsWith('http')) {
      return res.status(400).json(errorResponse('Link deve começar com http:// ou https://'));
    }

    if (type === 'youtube' && materialContent) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
      if (!youtubeRegex.test(materialContent)) {
        return res.status(400).json(errorResponse('URL do YouTube inválida'));
      }
    }

    // Atualizar material
    await material.update({
      title: title || material.title,
      description: description !== undefined ? description : material.description,
      type: type || material.type,
      content: materialContent,
      file_path: filePath,
      disability_type: disability_type || material.disability_type,
      is_active: is_active !== undefined ? is_active : material.is_active,
    });

    res.json(successResponse(material, 'Material atualizado com sucesso'));

  } catch (error) {
    console.error('Erro ao atualizar material:', error);
    
    // Deletar arquivo se houve erro
    if (req.file) {
      deleteFile(req.file.path);
    }
    
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

/**
 * Deletar material
 */
const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se o professor tem acesso ao material
    const teacher = await Teacher.findOne({
      where: { user_id: userId },
    });

    if (!teacher) {
      return res.status(404).json(errorResponse('Professor não encontrado'));
    }

    const material = await Material.findOne({
      where: { id },
      include: [
        {
          model: Conteudo,
          as: 'conteudo',
          include: [
            {
              model: Disciplina,
              as: 'disciplina',
              where: { teacher_id: teacher.id },
            },
          ],
        },
      ],
    });

    if (!material) {
      return res.status(404).json(errorResponse('Material não encontrado ou você não tem permissão para acessá-lo'));
    }

    // Deletar arquivo se existir
    if (material.file_path) {
      deleteFile(material.file_path);
    }

    // Deletar material
    await material.destroy();

    res.json(successResponse(null, 'Material deletado com sucesso'));

  } catch (error) {
    console.error('Erro ao deletar material:', error);
    res.status(500).json(errorResponse('Erro interno do servidor'));
  }
};

module.exports = {
  listMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
};

