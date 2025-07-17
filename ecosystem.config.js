module.exports = {
  apps : [{
    name: "cost-management",
    script: "node_modules/next/dist/bin/next", // ชี้ไปที่ Next.js executable โดยตรง
    args: "start -p 3000",
    env: {
      NODE_ENV: "production"
    },
    
    // exec_mode: "cluster",
    // instances: 2, 
    watch: false, 
    ignore_watch: ["node_modules", ".git"], 
    log_file: "logs/combined.log", 
    error_file: "logs/error.log",
    out_file: "logs/out.log", 
    time: true 
  }]
};