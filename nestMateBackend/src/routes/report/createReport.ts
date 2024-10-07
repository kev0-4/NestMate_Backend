import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { reportSchema } from "../../zod/report";

export const createReport = async (c: Context) => {
  const authUser = c.get("userId");

  if (!authUser) return c.json({ error: "Unauthorized" }, 401);

  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const { reportedUserId, reason } = reportSchema.parse(body);

    const reportedUser = await prisma.user.findUnique({
      where: { id: reportedUserId },
    });
    if (!reportedUser) return c.json({ error: "Reported user not found" }, 404);

    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: authUser.id,
        reportedUserId: reportedUserId,
        status: "pending",
      },
    });

    if (existingReport)
      return c.json(
        { error: "An active report already exists for this user" },
        409
      );

    const newReport = await prisma.report.create({
      data: {
        reporterId: authUser.id,
        reportedUserId: reportedUserId,
        reason: reason,
        status: "pending",
      },
    });

    return c.json(
      { message: "Report filed successfully", report: newReport },
      201
    );
  } catch (error) {
    console.error("Error creating report:", error);
    return c.json({ error: "Failed to file report" }, 500);
  }
};
