import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MarkdownRenderer } from '../../src/features/academics/ui/components/MarkdownRenderer';


describe('MarkdownRenderer Component', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });


  it('renders standard Markdown headings and list items properly', () => {
    const markdownContent = `
# Mid-Term Exam Syllabus
* Chapter 1: Combinational Logic
* Chapter 2: Sequential Circuits
    `;


    render(<MarkdownRenderer content={markdownContent} />);


    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mid-Term Exam Syllabus');
    expect(screen.getByText('Chapter 1: Combinational Logic')).toBeInTheDocument();
    expect(screen.getByText('Chapter 2: Sequential Circuits')).toBeInTheDocument();
  });


  it('renders syntax-highlighted code blocks with language pills and copy buttons', () => {
    const codeMarkdown = '```typescript\nconst activeSemester = 5;\nconsole.log(activeSemester);\n```';


    render(<MarkdownRenderer content={codeMarkdown} />);


    expect(screen.getByText('typescript')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy code/i })).toBeInTheDocument();
    expect(screen.getByText(/const activeSemester = 5;/)).toBeInTheDocument();
  });


  it('copies code snippet to clipboard and displays feedback state on click', async () => {
    const codeMarkdown = '```python\ndef solve_f2l():\n    return "Algorithm Executed"\n```';


    render(<MarkdownRenderer content={codeMarkdown} />);


    const copyBtn = screen.getByRole('button', { name: /copy code/i });
    fireEvent.click(copyBtn);


    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'def solve_f2l():\n    return "Algorithm Executed"\n',
    );


    await waitFor(() => {
      expect(screen.getByText(/copied!/i)).toBeInTheDocument();
    });
  });


  it('formats GitHub Flavored Markdown (GFM) tables correctly', () => {
    const tableMarkdown = `
| Subject | Credits | Room |
| :--- | :--- | :--- |
| Digital Logic | 4 | 138 |
| Computer Networks | 3 | 204 |
    `;


    render(<MarkdownRenderer content={tableMarkdown} />);


    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Digital Logic')).toBeInTheDocument();
    expect(screen.getByText('138')).toBeInTheDocument();
    expect(screen.getByText('Computer Networks')).toBeInTheDocument();
  });
});