import express from "express";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { auth } from "../middleware/auth.js"; // ajuste o caminho conforme seu projeto

import { ProfileBanking } from "../models/ProfileBanking.js";

const router = express.Router();
dayjs.extend(customParseFormat);
/**
 * Criar perfil bancário
 */
router.post("/banking", auth, async (req, res) => {
  try {
    const { profile, banking } = req.body;

    if (profile?.birthDate && profile.birthDate.includes("/")) {
      profile.birthDate = dayjs(profile.birthDate, "DD/MM/YYYY").toDate();
    }

    // Criar o documento com o ID do usuário logado
    const newProfileBanking = new ProfileBanking({
      user: req.user._id,  // 👈 importante
      profile,
      banking
    });

    await newProfileBanking.save();

    res.status(201).json(newProfileBanking);
  } catch (err) {
    console.error("❌ Erro ao salvar perfil bancário:", err);
    res.status(500).json({ error: err.message });
  }
});


/**
 * Listar todos os perfis bancários
 */
router.get("/banking", async (req, res) => {
  try {
    const profiles = await ProfileBanking.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Buscar um perfil bancário por ID
 */
router.get("/banking/:id", async (req, res) => {
  try {
    const profile = await ProfileBanking.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: "Perfil não encontrado" });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Atualizar perfil bancário por ID
 */
router.put("/banking/:id", async (req, res) => {
  try {
    let { profile, banking } = req.body;

    if (profile?.birthDate && profile.birthDate.includes("/")) {
      profile.birthDate = dayjs(profile.birthDate, "DD/MM/YYYY").toDate();
    }

    const updated = await ProfileBanking.findByIdAndUpdate(
      req.params.id,
      { profile, banking },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Perfil não encontrado" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Deletar perfil bancário
 */
router.delete("/banking/:id", async (req, res) => {
  try {
    const deleted = await ProfileBanking.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Perfil não encontrado" });
    }
    res.json({ message: "Perfil deletado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
