# CreatorConnect: System Architecture & Data Flow

This document provides a high-level overview of the CreatorConnect system architecture, focusing on the dual-layer matching process.

## Matching Algorithm Flowchart

The following diagram illustrates the end-to-end process that occurs when a user submits a new brief to find creator matches. The system is designed for resilience, with a clear fallback path if the AI-powered semantic matching layer fails.

```mermaid
graph TD
    subgraph User Interaction
        A[User Submits Brief via UI] --> B{POST /api/briefs};
    end

    subgraph API Backend Processing
        B --> C{Validate Input Data};
        C -- Valid --> D[Connect to MongoDB];
        C -- Invalid --> E[Return 400 Bad Request];

        D -- Success --> F[Fetch All Creator Profiles];
        D -- Failure --> G[Return 500 Server Error];

        F --> G1(Start Traditional Matcher);
        F --> G2(Start Enhanced Matcher);
    end

    subgraph Traditional Matching (Rule-Based)
        G1 --> H[Iterate Creators];
        H --> I{Calculate Rule-Based Score};
        I -- Criteria Met --> J[Add to Traditional Matches List];
        J --> K[Sort by Score];
    end

    subgraph Enhanced Matching (AI-Powered)
        G2 -- GEMINI_API_KEY Present --> L{Generate Embedding for Brief};
        L -- Success --> M[Calculate Semantic Similarity];
        M --> N{Generate AI Explanation};
        N --> O[Calculate Hybrid Score];
        O --> P[Add to Enhanced Matches List];
        P --> Q[Sort by Hybrid Score];
        
        G2 -- No API Key / AI Fails --> R(Fallback: AI Disabled);
    end

    subgraph Final Response Aggregation
        K --> S{Aggregate Results};
        Q --> S;
        R --> S;
        S --> T[Construct Final JSON Response];
        T --> U[Return 200 OK with Matches];
    end

    style E fill:#f99,stroke:#333,stroke-width:2px
    style G fill:#f99,stroke:#333,stroke-width:2px
    style R fill:#f9e,stroke:#333,stroke-width:2px
```

### Key Stages Explained

1.  **Brief Submission**: The process begins when a client submits their project details through the `BriefForm` on the frontend. This triggers a `POST` request to the `/api/briefs` endpoint.
2.  **Data Validation & Setup**: The backend first validates the incoming data. If the data is invalid, it immediately returns a `400` error. Otherwise, it establishes a connection to MongoDB and fetches all creator profiles.
3.  **Dual-Layer Execution**: The system initiates two matching processes in parallel:
    *   **Traditional Matcher (`matcher.ts`)**: This layer iterates through every creator and calculates a score based on concrete, rule-based criteria (location, category, budget, etc.).
    *   **Enhanced Matcher (`enhancedMatcher.ts`)**: This layer is activated if a `GEMINI_API_KEY` is configured. It generates a vector embedding for the user's brief and then calculates the semantic similarity (dot product) against the pre-computed embeddings of each creator. It also uses the AI to generate a natural language explanation for why each creator is a good match.
4.  **Fallback System**: If the AI service fails at any point (e.g., API key is invalid, the service is down), the enhanced matching process is gracefully aborted. The system will still function, relying solely on the results from the traditional matcher.
5.  **Aggregation & Response**: The results from both matchers are aggregated. The final response object includes the original brief data, the list of `enhancedMatches` (if available), the list of `traditionalMatches`, and metadata like processing time and whether the AI was enabled. This complete package is then sent back to the frontend to be displayed in the `MatchList` component.
