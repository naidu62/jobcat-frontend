import { adaptJob } from "@/lib/jobAdapter";

// after fetch
const raw = await res.json();
setJob(adaptJob(raw));