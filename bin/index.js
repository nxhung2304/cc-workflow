#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');

const program = new Command();
program.version('1.0.0');

program
  .command('init')
  .description('Setup global cc-workflow in ~/')
  .action(async () => {
    const globalDir = path.join(process.env.HOME, '.cc-workflow');
    await fs.ensureDir(globalDir);

    // Copy templates/global to globalDir
    const templatesDir = path.join(__dirname, '..', 'templates', 'global');
    await fs.copy(templatesDir, globalDir);

    // Create symlink ~/.claude -> ~/.cc-workflow/.claude
    const claudeSymlink = path.join(process.env.HOME, '.claude');
    if (!fs.existsSync(claudeSymlink)) {
      await fs.ensureSymlink(path.join(globalDir, '.claude'), claudeSymlink);
    }

    console.log('✅ Global setup done! Rules and templates in ~/.cc-workflow/');
    console.log('Use `npx cc-workflow setup` in any project.');
  });

program
  .command('setup')
  .description('Setup cc-workflow in current project')
  .action(async () => {
    const projectDir = process.cwd();
    const claudeDir = path.join(projectDir, '.claude');

    await fs.ensureDir(claudeDir);

    // Copy templates/project to .claude/
    const templatesProjectDir = path.join(__dirname, '..', 'templates', 'project');
    await fs.copy(templatesProjectDir, claudeDir);

    // Generate CLAUDE.md (basic template)
    const claudeMdPath = path.join(claudeDir, 'CLAUDE.md');
    const claudeMdContent = `# CLAUDE.md – Project Context

**Project**: ${path.basename(projectDir)}
**Type**: Greenfield (detected from no brownfield folder)
**Tech Stack**: Auto-detect (e.g., Rails from Gemfile)
**Next Story ID**: 1
**Rules**: .claude/rules/ + global override from ~/.cc-workflow/

**Generated**: ${new Date().toISOString()} by cc-workflow setup`;
    await fs.writeFile(claudeMdPath, claudeMdContent);

    console.log('✅ Project setup done! .claude/ created with CLAUDE.md.');
    console.log('Run `claude /workflow` to start.');
  });

program.parse(process.argv);
