// OpenClaw Error Recovery Hook
// 自动检测和修复常见错误，并提供详细反馈

module.exports = {
  // 工具调用失败后的钩子
  after_tool_call: async (context) => {
    const { toolName, toolParams, result, error, session } = context;
    
    // 如果工具执行失败，尝试自动修复
    if (error || (result && result.status === 'error')) {
      const errorMessage = error?.message || result?.error || 'Unknown error';
      
      // 向用户显示检测到的错误
      console.log(`[🔍 Error Recovery] 检测到 ${toolName} 工具执行失败:`);
      console.log(`    错误信息: ${errorMessage}`);
      
      // 添加用户可见的反馈消息
      context.userFeedback = `\n🔧 **自动错误修复中...**\n`;
      context.userFeedback += `📋 检测到错误: \`${toolName}\` 工具执行失败\n`;
      context.userFeedback += `❌ 错误信息: ${errorMessage}\n`;
      
      // 检测常见的错误类型并尝试修复
      if (toolName === 'exec' && shouldRetryExecError(errorMessage)) {
        context.userFeedback += `🔄 正在尝试修复命令执行错误...\n`;
        return await attemptExecFix(context);
      }
      
      if (toolName === 'read' && errorMessage.includes('No such file or directory')) {
        context.userFeedback += `📁 正在处理文件不存在的问题...\n`;
        return await attemptCreateMissingFile(context);
      }
      
      if (toolName === 'write' && errorMessage.includes('Permission denied')) {
        context.userFeedback += `🔑 正在处理权限问题...\n`;
        return await attemptPermissionFix(context);
      }
      
      // 如果是代码错误，尝试自动修复
      if (isCodeError(errorMessage)) {
        context.userFeedback += `💻 检测到代码错误，正在分析修复方案...\n`;
        return await attemptCodeFix(context);
      }
      
      // 如果没有特定的修复方法，提供通用建议
      context.userFeedback += `💡 提供通用修复建议...\n`;
    }
    
    return context;
  },
  
  // 工具调用之前的钩子
  before_tool_call: async (context) => {
    const { toolName, toolParams } = context;
    
    // 对高风险操作提供预警
    if (toolName === 'exec' && toolParams.command && 
        (toolParams.command.includes('rm -rf') || 
         toolParams.command.includes('sudo') ||
         toolParams.command.includes('chmod 777'))) {
      context.userFeedback = `⚠️ **高风险操作检测**\n即将执行: \`${toolParams.command}\`\n`;
    }
    
    return context;
  },
  
  // 代理运行结束时的钩子
  agent_end: async (context) => {
    const { messages, runMetadata } = context;
    
    // 统计错误和修复情况
    let errorCount = 0;
    let fixAttempts = 0;
    
    messages.forEach(msg => {
      if (msg.role === 'tool' && msg.content) {
        if (typeof msg.content === 'string' && msg.content.includes('error')) {
          errorCount++;
        }
        if (typeof msg.content === 'string' && msg.content.includes('自动错误修复')) {
          fixAttempts++;
        }
      }
    });
    
    if (errorCount > 0 || fixAttempts > 0) {
      console.log(`[📊 Error Recovery Summary] 会话结束统计:`);
      console.log(`    检测到错误: ${errorCount} 个`);
      console.log(`    尝试修复: ${fixAttempts} 次`);
      
      context.userFeedback = `\n📊 **错误修复统计**\n`;
      context.userFeedback += `- 检测到错误: ${errorCount} 个\n`;
      context.userFeedback += `- 尝试修复: ${fixAttempts} 次\n`;
    }
    
    return context;
  }
};

// 判断是否应该重试 exec 错误
function shouldRetryExecError(errorMessage) {
  const retryableErrors = [
    'Command not found',
    'command not found',
    'Connection timed out',
    'Network is unreachable',
    'Temporary failure',
    'Resource temporarily unavailable'
  ];
  
  return retryableErrors.some(pattern => errorMessage.toLowerCase().includes(pattern.toLowerCase()));
}

// 尝试修复 exec 命令错误
async function attemptExecFix(context) {
  const { toolParams } = context;
  const command = toolParams.command;
  
  console.log(`[🔧 Error Recovery] 分析命令: ${command}`);
  context.userFeedback += `🔍 分析失败的命令: \`${command}\`\n`;
  
  // 如果命令未找到，尝试安装或建议替代命令
  if (command.includes('npm') || command.includes('yarn')) {
    context.userFeedback += `📦 检测到 Node.js 包管理器问题\n`;
    return suggestNodeSetup(context);
  }
  
  if (command.includes('python') || command.includes('pip')) {
    context.userFeedback += `🐍 检测到 Python 相关问题\n`;
    return suggestPythonSetup(context);
  }
  
  if (command.includes('git')) {
    context.userFeedback += `🌿 检测到 Git 相关问题\n`;
    return suggestGitSetup(context);
  }
  
  // 其他常见命令的修复建议
  return suggestGenericFix(context, command);
}

// 尝试创建缺失的文件
async function attemptCreateMissingFile(context) {
  const { toolParams } = context;
  const filePath = toolParams.path || toolParams.file_path;
  
  console.log(`[📁 Error Recovery] 处理缺失文件: ${filePath}`);
  context.userFeedback += `📝 文件不存在: \`${filePath}\`\n`;
  context.userFeedback += `💡 建议: 考虑创建该文件或检查路径是否正确\n`;
  
  return {
    ...context,
    autoFixSuggestion: `文件 ${filePath} 不存在，建议创建该文件或检查路径。`
  };
}

// 尝试修复权限问题
async function attemptPermissionFix(context) {
  const { toolParams } = context;
  const filePath = toolParams.path || toolParams.file_path;
  
  console.log(`[🔑 Error Recovery] 处理权限问题: ${filePath}`);
  context.userFeedback += `🚫 权限被拒绝: \`${filePath}\`\n`;
  context.userFeedback += `💡 建议: 考虑使用提升权限或更改文件所有权\n`;
  
  return {
    ...context,
    autoFixSuggestion: `权限问题，建议使用 chmod 或 chown 修改权限。`
  };
}

// 判断是否是代码错误
function isCodeError(errorMessage) {
  const codeErrorPatterns = [
    'SyntaxError',
    'TypeError',
    'ReferenceError', 
    'ImportError',
    'ModuleNotFoundError',
    'compilation error',
    'parse error'
  ];
  
  return codeErrorPatterns.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
}

// 尝试修复代码错误
async function attemptCodeFix(context) {
  const { toolParams, error } = context;
  const errorMessage = error?.message || 'Unknown code error';
  
  console.log(`[💻 Error Recovery] 分析代码错误: ${errorMessage}`);
  
  // 基于错误类型提供修复建议
  if (errorMessage.includes('SyntaxError')) {
    context.userFeedback += `🔴 语法错误检测\n`;
    context.userFeedback += `💡 修复建议: 检查括号、引号、分号是否匹配\n`;
    return {
      ...context,
      autoFixSuggestion: '语法错误：请检查代码中的括号、引号、分号等是否正确闭合。'
    };
  }
  
  if (errorMessage.includes('ImportError') || errorMessage.includes('ModuleNotFoundError')) {
    context.userFeedback += `📦 模块导入错误\n`;
    context.userFeedback += `💡 修复建议: 安装缺失的包或检查导入路径\n`;
    return {
      ...context,
      autoFixSuggestion: '导入错误：请安装所需的包或检查导入路径是否正确。'
    };
  }
  
  context.userFeedback += `🐛 通用代码错误\n`;
  context.userFeedback += `💡 修复建议: 请仔细检查代码逻辑和语法\n`;
  return {
    ...context,
    autoFixSuggestion: '代码错误：请检查代码逻辑和常见错误模式。'
  };
}

function suggestNodeSetup(context) {
  context.userFeedback += `🚀 修复方案: 安装 Node.js\n`;
  context.userFeedback += `📝 命令: \`brew install node\` (macOS)\n`;
  return {
    ...context,
    autoFixSuggestion: 'Node.js 未找到。安装方法: brew install node (macOS) 或访问 nodejs.org'
  };
}

function suggestPythonSetup(context) {
  context.userFeedback += `🐍 修复方案: 安装 Python\n`;
  context.userFeedback += `📝 命令: \`brew install python\` (macOS)\n`;
  return {
    ...context,
    autoFixSuggestion: 'Python 未找到。安装方法: brew install python (macOS) 或访问 python.org'
  };
}

function suggestGitSetup(context) {
  context.userFeedback += `🌿 修复方案: 安装或配置 Git\n`;
  context.userFeedback += `📝 命令: \`brew install git\` (macOS)\n`;
  return {
    ...context,
    autoFixSuggestion: 'Git 未找到或配置错误。安装方法: brew install git'
  };
}

function suggestGenericFix(context, command) {
  context.userFeedback += `❓ 通用修复建议\n`;
  context.userFeedback += `📝 失败命令: \`${command}\`\n`;
  context.userFeedback += `💡 建议: 检查命令是否存在，或手动执行测试\n`;
  return {
    ...context,
    autoFixSuggestion: `命令 '${command}' 执行失败。建议检查命令是否存在并先手动测试。`
  };
}