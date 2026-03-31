// File: Frontend/src/utils/exportPasswords.js
// Purpose: Converts an array of password entries to JSON, strips sensitive backend fields, and triggers download.
// Dependencies: none
// Production-safe: yes

export const exportToJSON = (entries) => {
  try {
    const confirmed = window.confirm(
      "⚠️ Security Warning\n\nThis file will contain your plaintext passwords.\nAnyone with access to this file can read all your passwords.\n\nAre you sure you want to export?"
    );

    if (!confirmed) return;

    const cleanedEntries = entries.map(entry => {
      const { userId, __v, iv, encryptedPassword, _id, ...clean } = entry;
      return clean;
    });

    const exportObj = {
      exportedAt: new Date().toISOString(),
      totalEntries: cleanedEntries.length,
      warning: "This file contains plaintext passwords. Store securely and delete after use.",
      entries: cleanedEntries
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    
    // vault-export-YYYY-MM-DD.json
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `vault-export-${dateStr}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error("Export failed. Please try again.");
  }
};
