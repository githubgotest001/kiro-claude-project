import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const dimensions = [
  {
    name: "coding",
    displayName: "编码能力",
    description: "评估模型的代码生成、理解和调试能力",
  },
  {
    name: "reasoning",
    displayName: "推理能力",
    description: "评估模型的逻辑推理和分析能力",
  },
  {
    name: "math",
    displayName: "数学能力",
    description: "评估模型的数学计算和问题求解能力",
  },
  {
    name: "multilingual",
    displayName: "多语言能力",
    description: "评估模型对多种语言的理解和生成能力",
  },
  {
    name: "instruction-following",
    displayName: "指令遵循能力",
    description: "评估模型准确遵循用户指令的能力",
  },
  {
    name: "knowledge-qa",
    displayName: "知识问答能力",
    description: "评估模型在知识问答任务中的准确性和全面性",
  },
];

async function main() {
  console.log("开始填充评测维度数据...");

  for (const dim of dimensions) {
    await prisma.dimension.upsert({
      where: { name: dim.name },
      update: {
        displayName: dim.displayName,
        description: dim.description,
      },
      create: dim,
    });
  }

  console.log(`已填充 ${dimensions.length} 个评测维度`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
