import { Router } from "express";
import { MemoryDb } from "../../../db/memory-db";
import { MemoryNoteRepository } from "./repo";
import type { INoteRepository, Note } from "./interfaces";
import { NoteService } from "./service";
import { NoteController } from "./controller";

const db = new MemoryDb<Note>();
const repo: INoteRepository = new MemoryNoteRepository(db);
const service = new NoteService(repo);
const controller = new NoteController(service);

export const noteRouter: Router = Router();

noteRouter.get("/", controller.getAll);
noteRouter.get("/:id", controller.getById);
noteRouter.post("/", controller.create);
noteRouter.put("/:id", controller.update);
noteRouter.delete("/:id", controller.delete);
