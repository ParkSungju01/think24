# 소비기록의 "AI 소비 분석" 카드는 실제 LLM 호출 없이 mock 텍스트로 구현한다

피그마 스펙 마커는 이 카드가 "AI가 구간별로 제일 많이 고민한 카테고리에 대해 피드백을 준다"고 명시하고 있고, 프로젝트에는 이미 같은 용도의 OpenAI 연동 패턴(`ai-generate-questions`, `ai-generate-verdict` Edge Function)이 존재해 그대로 재사용할 수도 있었다. 하지만 이 프로젝트는 실사용자를 받는 서비스가 아니라 공모전용 프로토타입이므로, 새 Edge Function을 추가하는 대신 고정 문구 하나만 하드코딩해 예시로만 보여주기로 결정했다(화면 전체가 정적 mock이라는 더 큰 결정, `docs/adr/0003-spending-record-fully-static-mock.md`의 일부).

새 고민 생성 플로우의 AI 질문/판정 기능은 이 결정과 무관하게 기존 실제 OpenAI 연동을 그대로 유지한다. 코드만 보고 "왜 AI 카드인데 AI를 안 부르지?"라고 오해하지 않도록 이 문서를 남긴다.
