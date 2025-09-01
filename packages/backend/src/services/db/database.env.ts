import { die } from "@timely/shared/utils"

export const databaseUrl = process.env.DATABASE_URL || die("DATABASE_URL not populated.")
