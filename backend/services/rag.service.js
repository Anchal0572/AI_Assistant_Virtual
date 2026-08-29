// Lightweight Semantic RAG Retrieval Engine

export const chunkText = (text, chunkSize = 700, overlap = 100) => {
    if (!text) return []
    const chunks = []
    let start = 0
    let id = 1

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length)
        const chunkText = text.slice(start, end).trim()
        
        // Extract basic keywords for vector indexing
        const keywords = Array.from(new Set(
            chunkText.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .split(/\s+/)
                .filter(w => w.length > 3)
        ))

        chunks.push({
            chunkId: id++,
            text: chunkText,
            keywords
        })

        if (end === text.length) break
        start += (chunkSize - overlap)
    }

    return chunks
}

export const retrieveRelevantChunks = (query, documents, topK = 4) => {
    if (!query || !documents || documents.length === 0) return []

    const queryTokens = Array.from(new Set(
        query.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2)
    ))

    const scoredChunks = []

    documents.forEach(doc => {
        if (!doc.chunks || doc.chunks.length === 0) return

        doc.chunks.forEach(chunk => {
            let score = 0
            const chunkLower = chunk.text.toLowerCase()

            // Token overlap scoring
            queryTokens.forEach(token => {
                if (chunkLower.includes(token)) {
                    score += 2
                }
            })

            // Exact phrase match bonus
            if (chunkLower.includes(query.toLowerCase())) {
                score += 5
            }

            if (score > 0) {
                scoredChunks.push({
                    score,
                    filename: doc.filename,
                    chunkId: chunk.chunkId,
                    text: chunk.text
                })
            }
        })
    })

    // Sort by relevance score descending
    scoredChunks.sort((a, b) => b.score - a.score)
    return scoredChunks.slice(0, topK)
}

export const formatRAGPromptContext = (chunks) => {
    if (!chunks || chunks.length === 0) return ""

    let contextStr = "\n\n--- PERSONAL KNOWLEDGE BASE (UPLOADED DOCUMENTS CONTEXT) ---\n"
    chunks.forEach((c, idx) => {
        contextStr += `[Source ${idx + 1}: ${c.filename} | Chunk #${c.chunkId}]\n${c.text}\n\n`
    })
    contextStr += "--------------------------------------------------------\n"
    contextStr += "INSTRUCTION: Answer using the uploaded document context above whenever relevant. Explicitly cite sources in your response like 📄 **Source**: filename.txt [Chunk #X].\n"

    return contextStr
}
