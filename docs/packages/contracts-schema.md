# contracts 스키마 문서

이 문서는 `packages/contracts`가 현재 어떤 역할을 가지는지 설명한다.

## 목적

`packages/contracts`는 프론트엔드와 백엔드가 함께 쓰는 API 계약의 단일 소스다.

현재 `contracts`는 두 가지를 함께 가진다.

- 런타임 검증 스키마
- 스키마에서 추론한 TypeScript 타입

즉 `contracts`는 더 이상 타입 선언만 모아 둔 패키지가 아니다.

## 현재 구조

주요 파일:

- `packages/contracts/src/auth.ts`
  - 인증 요청/응답 계약
- `packages/contracts/src/chat.ts`
  - 채팅 세션, 메시지, 질문/응답 계약
- `packages/contracts/src/content.ts`
  - 카테고리, 지점, 문서 관련 계약
- `packages/contracts/src/schema-helpers.ts`
  - 공통 전처리와 스키마 helper

패턴은 다음과 같다.

```ts
export const CreateArticleRequestSchema = z.object({
  category_id: z.coerce.number().int().min(1),
  title: requiredTrimmedString(200),
  content: requiredTrimmedString()
}).strict();

export type CreateArticleRequest = z.infer<typeof CreateArticleRequestSchema>;
```

규칙:

- 타입은 가능하면 직접 `interface`로 다시 적지 않는다.
- 요청 shape와 검증 규칙은 스키마가 소유한다.
- 타입은 `z.infer`로 파생한다.
- 객체 스키마는 기본적으로 `.strict()`를 사용해 알려지지 않은 필드를 막는다.

## 왜 이렇게 바꿨는가

이전 구조는 같은 요청 모델을 두 번 관리했다.

- `packages/contracts`
  - 공용 요청 타입
- `apps/backend/src/features/**/dto`
  - Nest DTO + `class-validator`

이 구조는 다음 문제가 있었다.

- 필드 shape 중복
- 검증 규칙 변경 시 수정 지점 2곳
- 프론트는 타입만 공유하고 런타임 규칙은 공유하지 못함

현재 구조는 스키마를 `contracts`로 올리고, 각 앱은 그 스키마를 실행만 한다.

## 백엔드에서의 사용 방식

백엔드는 Nest DTO 클래스를 더 이상 사용하지 않는다.

대신 controller 경계에서 Zod 기반 pipe로 검증한다.

예시:

```ts
const createArticleBodyPipe = new ZodValidationPipe(CreateArticleRequestSchema);

@Post()
create(@Body(createArticleBodyPipe) body: CreateArticleRequest) {
  return this.articleService.create(body);
}
```

의미:

- 검증 정의는 `contracts`
- 검증 실행은 backend controller 경계
- service/repository는 검증된 타입만 받음

## 프론트엔드에서의 사용 방식

프론트는 기존처럼 타입만 가져다 쓸 수 있고, 필요하면 같은 스키마로 입력/응답 검증도 할 수 있다.

권장 경계:

- 폼 submit 직전 입력 검증
- API 응답 수신 직후 parse
- URL query parsing

지금 저장소는 우선 백엔드 요청 경계부터 `contracts` 스키마를 사용하도록 옮긴 상태다.

## 추가 규칙

- Nest 전용 DTO 클래스는 새로 만들지 않는다.
- 새 요청 모델을 추가할 때는 먼저 `packages/contracts`에 `Schema`와 `type`을 만든다.
- backend controller는 `@Body()` 또는 `@Query()`에 Zod pipe를 붙인다.
- 프론트에서 같은 모델을 쓸 때는 `Schema`와 추론 타입을 재사용한다.

## 현재 한계

- 응답 모델은 아직 일부가 타입 중심이다.
- Swagger 자동화가 필요해지면 별도 통합 전략이 필요하다.
- 프론트는 아직 모든 API 응답을 parse하지는 않는다.

즉 지금 단계는 "요청 계약의 단일 소스화"를 먼저 완료한 상태로 보면 된다.
