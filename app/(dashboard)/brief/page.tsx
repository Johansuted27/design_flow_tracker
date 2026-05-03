import { auth } from "@/auth"
import { SubmitBriefClient } from "@/components/brief/submit-brief-client"
import { prisma } from "@/lib/db"

export const metadata = { title: "Submit Brief" }

export default async function SubmitBriefPage() {
  const session = await auth()
  if (!session) return null

  const managers = await prisma.user.findMany({
    where: { role: { in: ["manager", "spv"] }, activeStatus: true },
    select: { id: true, name: true, email: true },
  })

  return <SubmitBriefClient user={session.user} managers={managers} />
}
