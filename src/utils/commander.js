import { program } from "commander";

program
  .option("-m, --mode <mode>", "Development environment to work with", "development")
  .option("-p, --port <number>", "Port to use", 8080)
  .option("-d, --debug", "Debug mode variable", false)
  .parse();

console.log("argv", program.args);
console.log("opts", program.opts());

export default program;