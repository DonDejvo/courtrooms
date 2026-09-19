import { Router } from "express";
import courtroomController from "../controllers/courtroomController";

const router = Router();

router.route("/").get(courtroomController.getCourtroomList);
router.route("/UploadScheduleFromPdf").post(courtroomController.schedulePdfFile, courtroomController.uploadScheduleFromPdf);
router.route("/RemoveSchedule").post(courtroomController.removeSchedule);
router.route("/RemoveAllSchedules").post(courtroomController.removeAllSchedules);
router.route("/:code").get(courtroomController.getCourtroom);

router.route("/").post(courtroomController.createCourtroom);
router.route("/").delete(courtroomController.deleteCourtroom);

export default router;