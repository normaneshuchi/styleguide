# JIBUSASA STYLE GUIDE (TYPESCRIPT & REACT)

## Introduction

Welcome to our TypeScript Style Guide! This guide is designed to provide you with a set of best practices and conventions that will help you write clean, efficient, and maintainable TypeScript code for both backend and frontend development.

## Why TypeScript?

TypeScript, a statically typed superset of JavaScript, has gained popularity for its ability to catch errors at compile-time, its powerful type system, and its compatibility with JavaScript libraries. Whether you're developing a Node.js server or a React application, TypeScript can enhance your productivity, improve code quality, and make your codebase easier to understand and debug.

## What's Inside?

This guide covers a wide range of topics, including:

- **Type Safety**: Learn how to leverage TypeScript's type system to write safer code and catch errors before they happen.
- **Code Quality**: Discover how to write clean, readable, and maintainable code that adheres to industry standards.
- **Backend and Frontend Practices**: Understand the specific considerations and best practices for both backend and frontend TypeScript development.
- **Tooling**: Get to know the tools that can help you write better TypeScript code, including linters, formatters, and IDE extensions.

By following the guidelines and best practices outlined in this guide, you'll be well on your way to becoming a more effective and efficient TypeScript developer. Happy coding!

## Requirements

Style Guide requires you to use:

**TypeScript v5**

**typescript-eslint v7 with strict-type-checked configuration enabled.**

Style Guide assumes using, but is not limited to:

- React as UI library for frontend conventions.



## TLDR: 

- Strive for data immutability. 
- Embrace const assertions. 
- Avoid type assertions. 
- Strive for functions to be pure, stateless and have single responsibility. 
- Majority of function arguments should be required (use optional sparingly). 
- Strong emphasis to keep naming conventions consistent and readable. 
- Use named exports. 
- Code is organized and grouped by feature. Collocate code as close as possible to where it's relevant. 
- UI components must only show derived state and send events, nothing more (no business logic). 
- Test business logic, not implementation details. 





## Data Immutability

Majority of the data should be immutable (use Readonly, ReadonlyArray, always return new array, object etc). To keep cognitive load for future developers low, try to keep data objects small.
As an exception mutations should be used sparingly in cases where truly necessary: complex objects, performance reasoning etc.



## Types

### Type Inference

As rule of thumb, explicitly declare a type when it help narrows it.

```
// ❌ Avoid - Type can be inferred
const userRole: string = 'admin'; // Type 'string'
const employees = new Map<string, number>([['Gabriel', 32]]);
const [isActive, setIsActive] = useState<boolean>(false);

// ✅ Use type inference
const USER_ROLE = 'admin'; // Type 'admin'
const employees = new Map([['Gabriel', 32]]); // Type 'Map<string, number>'
const [isActive, setIsActive] = useState(false); // Type 'boolean'


// ❌ Avoid - Type can be narrowed
const employees = new Map(); // Type 'Map<any, any>'
employees.set('Lea', 'foo-anything');
type UserRole = 'admin' | 'guest';
const [userRole, setUserRole] = useState('admin'); // Type 'string'

// ✅ Use explicit type declaration to narrow the type
const employees = new Map<string, number>(); // Type 'Map<string, number>'
employees.set('Gabriel', 32);
type UserRole = 'admin' | 'guest';
const [userRole, setUserRole] = useState<UserRole>('admin'); // Type 'UserRole'
```



### Return Types

Including return type annotations is highly encouraged, although not required (eslint rule).

Consider benefits when explicitly typing the return value of a function:

- Return values makes it clear and easy to understand to any calling code what type is returned.
- In the case where there is no return value, the calling code doesn't try to use the undefined value when it shouldn't.
- Surface potential type errors faster in the future if there are code changes that change the return type of the function.
- Easier to refactor, since it ensures that the return value is assigned to a variable of the correct type.
- Similar to writing tests before implementation (TDD), defining function arguments and return type, gives you the opportunity to discuss the feature functionality and its interface ahead of implementation.
- Although type inference is very convenient, adding return types can save TypeScript compiler a lot of work.



### Template Literal Types

Embrace using template literal types, instead of just (wide) string type.
Template literal types have many applicable use cases e.g. API endpoints, routing, internationalization, database queries, CSS typings ...

```
// ❌ Avoid
const userEndpoint = '/api/users'; // Type 'string' - no error
// ✅ Use
type ApiRoute = 'users' | 'posts' | 'comments';
type ApiEndpoint = `/api/${ApiRoute}`;
const userEndpoint: ApiEndpoint = '/api/users';

// ❌ Avoid
const homeTitleTranslation = 'translation.home.title'; // Type 'string' - no error
// ✅ Use
type LocaleKeyPages = 'home' | 'about' | 'contact';
type TranslationKey = `translation.${LocaleKeyPages}.${string}`;
const homeTitleTranslation: TranslationKey = 'translation.home.title';

// ❌ Avoid
const color = 'blue-450'; // Type 'string' - no error
// ✅ Use
type BaseColor = 'blue' | 'red' | 'yellow' | 'gray';
type Variant = 50 | 100 | 200 | 300 | 400;
// Type blue-50, blue-100, blue-200, blue-300, blue-400, red-50, red-100, #AD3128 ...
type Color = `${BaseColor}-${Variant}` | `#${string}`;
```



### Type any & unknown

`any` data type must not be used as it represents literally “any” value that TypeScript defaults to and skips type checking since it cannot infer the type. As such, `any` is dangerous, it can mask severe programming errors.

When dealing with ambiguous data type use `unknown`, which is the type-safe counterpart of any.
`unknown` doesn't allow dereferencing all properties (anything can be assigned to unknown, but unknown isn’t assignable to anything).

```
// ❌ Avoid any
const foo: any = 'five';
const bar: number = foo; // no type error

// ✅ Use unknown
const foo: unknown = 5;
const bar: number = foo; // type error - Type 'unknown' is not assignable to type 'number'

// Narrow the type before dereferencing it using:
// Type guard
const isNumber = (num: unknown): num is number => {
  return typeof num === 'number';
};
if (!isNumber(foo)) {
  throw Error(`API provided a fault value for field 'foo':${foo}. Should be a number!`);
}
const bar: number = foo;

// Type assertion
const bar: number = foo as number;
```



### Type & Non-nullability Assertions

Type assertions user as User and non-nullability assertions user!.name are unsafe. Both only silence TypeScript compiler and increase the risk of crashing application at runtime.
They can only be used as an exception (e.g. third party library types mismatch, dereferencing unknown etc.) with strong rational why being introduced into codebase.

```
type User = { id: string; username: string; avatar: string | null };
// ❌ Avoid type assertions
const user = { name: 'Nika' } as User;
// ❌ Avoid non-nullability assertions
renderUserAvatar(user!.avatar); // Runtime error

const renderUserAvatar = (avatar: string) => {...}
```



### Type Error

If TypeScript error can't be mitigated, as last resort use `@ts-expect-error` to suppress it (eslint rule). If at any future point suppressed line becomes error-free, TypeScript compiler will indicate it.
`@ts-ignore` is not allowed, where `@ts-expect-error` must be used with provided description (eslint rule).

```
// ❌ Avoid @ts-ignore
// @ts-ignore
const newUser = createUser('Gabriel');

// ✅ Use @ts-expect-error with description
// @ts-expect-error: The library definition is wrong, createUser accepts string as an argument.
const newUser = createUser('Gabriel');
```



### Type definition

TypeScript offers two options for type definitions - type and interface. As they come with some functional differences in most cases they can be used interchangeably. We try to limit syntax difference and pick one for consistency.

All types must be defined with type alias .

```
// ❌ Avoid interface definitions
interface UserRole = 'admin' | 'guest'; // invalid - interface can't define (commonly used) type unions

interface UserInfo {
  name: string;
  role: 'admin' | 'guest';
}

// ✅ Use type definition
type UserRole = 'admin' | 'guest';

type UserInfo = {
  name: string;
  role: UserRole;
};
```

In case of declaration merging (e.g. extending third-party library types) use `interface` and disable lint rule.

```
// types.ts
declare namespace NodeJS {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  export interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    PORT: string;
    CUSTOM_ENV_VAR: string;
  }
}

// server.ts
app.listen(process.env.PORT, () => {...}
```



### Array Types

Array types must be defined with generic syntax.

```
// ❌ Avoid
const x: string[] = ['foo', 'bar'];
const y: readonly string[] = ['foo', 'bar'];

// ✅ Use
const x: Array<string> = ['foo', 'bar'];
const y: ReadonlyArray<string> = ['foo', 'bar'];
```



## Functions

Function conventions should be followed as much as possible (some of the conventions derives from functional programming basic concepts):

### General

Function:

- should have single responsibility.
- should be stateless where the same input arguments return same value every single time.
- should accept at least one argument and return data.
- should not have side effects, but be pure. It's implementation should not modify or access variable value outside its local environment (global state, fetching etc.).

### Single Object Arg

To keep function readable and easily extensible for the future (adding/removing args), strive to have single object as the function arg, instead of multiple args.
As exception this does not apply when having only one primitive single arg (e.g. simple functions isNumber(value), implementing currying etc.).

```
// ❌ Avoid having multiple arguments
transformUserInput('client', false, 60, 120, null, true, 2000);

// ✅ Use options object as argument
transformUserInput({
  method: 'client',
  isValidated: false,
  minLines: 60,
  maxLines: 120,
  defaultInput: null,
  shouldLog: true,
  timeout: 2000,
});
```

### Required & Optional Args

**Strive to have majority of args required and use optional sparingly.**
If function becomes to complex it probably should be broken into smaller pieces.
An exaggerated example where implementing 10 functions with 5 required args each, is better then implementing one "can do it all" function that accepts 50 optional args.

#### Args as Discriminated Union

When applicable use discriminated union type to eliminate optional args, which will decrease complexity on function API and only necessary/required args will be passed depending on its use case.

```
// ❌ Avoid optional args as they increase complexity of function API
type StatusParams = {
  data?: Products;
  title?: string;
  time?: number;
  error?: string;
};

// ✅ Strive to have majority of args required, if that's not possible,
// use discriminated union for clear intent on function usage
type StatusParamsSuccess = {
  status: 'success';
  data: Products;
  title: string;
};

type StatusParamsLoading = {
  status: 'loading';
  time: number;
};

type StatusParamsError = {
  status: 'error';
  error: string;
};

type StatusParams = StatusSuccess | StatusLoading | StatusError;

export const parseStatus = (params: StatusParams) => {...
```



## Variables

### Const assertion

Strive to use const assertion `as const`:

- type is narrowed
- object gets `readonly` properties
- array becomes `readonly` tuple

```
// ❌ Avoid declaring constants without const assertion
const FOO_LOCATION = { x: 50, y: 130 }; // Type { x: number; y: number; }
FOO_LOCATION.x = 10;
const BAR_LOCATION = [50, 130]; // Type number[]
BAR_LOCATION.push(10);
const RATE_LIMIT = 25;
// RATE_LIMIT_MESSAGE type - string
const RATE_LIMIT_MESSAGE = `Rate limit exceeded! Max number of requests/min is ${RATE_LIMIT}.`;



// ✅ Use const assertion
const FOO_LOCATION = { x: 50, y: 130 } as const; // Type '{ readonly x: 50; readonly y: 130; }'
FOO_LOCATION.x = 10; // Error
const BAR_LOCATION = [50, 130] as const; // Type 'readonly [10, 20]'
BAR_LOCATION.push(10); // Error
const RATE_LIMIT = 25;
  // RATE_LIMIT_MESSAGE type - 'Rate limit exceeded! Max number of requests/min is 25.'
const RATE_LIMIT_MESSAGE = `Rate limit exceeded! Max number of requests/min is ${RATE_LIMIT}.` as const;
```

exhaustiveness check, code implements all possible type values  	

```
const shapes = [
  { kind: 'square', size: 7 },
  { kind: 'rectangle', width: 12, height: 6 },
  { kind: 'circle', radius: 23 },
] as const;

type Shape = (typeof shapes)[number];

const getShapeArea = (shape: Shape) => {
  *// Error - Switch is not exhaustive. Cases not matched: "circle"*
  switch (shape.kind) {
    case 'square':
      return shape.size * shape.size;
    case 'rectangle':
      return shape.width * shape.size; *// Error - Property 'size' does not exist on type 'rectangle'*
  }
};
```



### Enums & Const Assertion

Const assertion must be used over enum. While enums can still cover use cases as const assertion would, we tend to avoid it. Some of the reasonings as mentioned in TypeScript documentation

```
// ❌ Avoid using enums
enum UserRole {
  GUEST,
  MODERATOR,
  ADMINISTRATOR,
}

enum Color {
  PRIMARY = '#B33930',
  SECONDARY = '#113A5C',
  BRAND = '#9C0E7D',
}

// ✅ Use const assertion
const USER_ROLES = ['guest', 'moderator', 'administrator'] as const;
type UserRole = (typeof USER_ROLES)[number]; // Type "guest" | "moderator" | "administrator"

// Use satisfies if UserRole type is already defined - e.g. database schema model
type UserRoleDB = ReadonlyArray<'guest' | 'moderator' | 'administrator'>;
const AVAILABLE_ROLES = ['guest', 'moderator'] as const satisfies UserRoleDB;

const COLOR = {
  primary: '#B33930',
  secondary: '#113A5C',
  brand: '#9C0E7D',
} as const;
type Color = typeof COLOR;
type ColorKey = keyof Color; // Type "PRIMARY" | "SECONDARY" | "BRAND"
type ColorValue = Color[ColorKey]; // Type "#B33930" | "#113A5C" | "#9C0E7D"
```



### Null & Undefined

In TypeScript types `null` and `undefined` many times can be used interchangeably.
Strive to:

- Use `null` to explicitly state it has no value - assignment, return function type etc.
- Use `undefined` assignment when the value doesn't exist. E.g. exclude fields in form, request payload, database query

### Naming

Strive to keep naming conventions consistent and readable, with important context provided, because another person will maintain the code you have written.

#### Named Export

Named exports must be used to ensure that all imports follow a uniform pattern.
This keeps variables, functions... names consistent across the entire codebase.
Named exports have the benefit of erroring when import statements try to import something that hasn't been declared.

In case of exceptions e.g. Next.js pages, disable rule:

```
// .eslintrc.js
overrides: [
  {
    files: ["src/pages/**/*"],
    rules: { "import/no-default-export": "off" },
  },
],
```

#### Naming Conventions

While it's often hard to find the best name, try optimize code for consistency and future reader by following conventions:

##### Variables

###### Locals

Camel case
products, productsFiltered

###### Booleans

Prefixed with is, has etc.
isDisabled, hasProduct

###### Constants

Capitalized
PRODUCT_ID

###### Object constants

Singular, capitalized with const assertion and optionally satisfies type (if there is one).

```
const ORDER_STATUS = {
  pending: 'pending',
  fulfilled: 'fulfilled',
  error: 'error',
} as const satisfies OrderStatus;
```

##### Functions

Camel case
`filterProductsByType`, `formatCurrency`

##### Generics

A name starts with the capital letter T `TRequest`, `TFooBar.
Avoid (popular convention) naming generics with one character `T`, `K` etc., the more variables we introduce, the easier it is to mistake them.

```ts
// ❌ Avoid naming generics with one character
const createPair = <T, K extends string>(first: T, second: K): [T, K] => {
  return [first, second];
};
const pair = createPair(1, 'a');

// ✅ Name starts with the capital letter T
const createPair = <TFirst, TSecond extends string>(first: TFirst, second: TSecond): [TFirst, TSecond] => {
  return [first, second];
};
const pair = createPair(1, 'a');
```



[Eslint rule](https://typescript-eslint.io/rules/naming-convention) implements:

```ts
// .eslintrc.js
'@typescript-eslint/naming-convention': [
  'error',
  {
    selector: 'typeParameter',
    format: ['PascalCase'],
    custom: { regex: '^T[A-Z]', match: true },
  },
],
```

##### Abbreviations & Acronyms

Treat acronyms as whole words, with capitalized first letter only.

```
// ❌ Avoid
const FAQList = ['qa-1', 'qa-2'];
const generateUserURL(params) => {...}

// ✅ Use
const FaqList = ['qa-1', 'qa-2'];
const generateUserUrl(params) => {...}
```

In favor of readability, strive to avoid abbreviations, unless they are widely accepted and necessary.

```ts
// ❌ Avoid
const GetWin(params) => {...}

// ✅ Use
const GetWindow(params) => {...}
```



##### React Components

Pascal case
`ProductItem`, `ProductsPage`

###### Prop Types

React component name following "Props" postfix
`[ComponentName]Props - ProductItemProps, ProductsPageProps`

###### Callback Props

Event handler (callback) props are prefixed as on* - e.g. onClick.
Event handler implementation functions are prefixed as handle* - e.g. handleClick

```tsx
// ❌ Avoid inconsistent callback prop naming
<Button click={actionClick} />
<MyComponent userSelectedOccurred={triggerUser} />

// ✅ Use prop prefix 'on*' and handler prefix 'handle*'
<Button onClick={handleClick} />
<MyComponent onUserSelected={handleUserSelected} />
```

##### React Hooks

Camel case, prefixed as 'use' symmetrically convention as `[value, setValue] = useState()`

```ts
// ❌ Avoid inconsistent useState hook naming
const [userName, setUser] = useState();
const [color, updateColor] = useState();
const [isActive, setActive] = useState();

// ✅ Use
const [name, setName] = useState();
const [color, setColor] = useState();
const [isActive, setIsActive] = useState();
```

Custom hook must always return an object:

```ts
// ❌ Avoid
const [products, errors] = useGetProducts();
const [fontSizes] = useTheme();

// ✅ Use
const { products, errors } = useGetProducts();
const { fontSizes } = useTheme();
```

#### Comments

In general try to avoid comments, by writing expressive code and name things what they are.

Use comments when you need to add context or explain choices that cannot be expressed through code (e.g. config files).
Comments should always be complete sentences. As rule of thumb try to explain `why` in comments, not `how` and `what`.

```ts
// ❌ Avoid
// convert to minutes
const m = s * 60;
// avg users per minute
const myAvg = u / m;

// ✅ Use
const SECONDS_IN_MINUTE = 60;
const minutes = seconds * SECONDS_IN_MINUTE;
const averageUsersPerMinute = noOfUsers / minutes;

// TODO: Filtering should be moved to the backend once API changes are released.
// Issue/PR - https://github.com/foo/repo/pulls/55124
const filteredUsers = frontendFiltering(selectedUsers);

// Use Fourier transformation to minimize information loss - https://github.com/dntj/jsfft#usage
const frequencies = signal.FFT();
```

## Source Organization

### Code Collocation

- Every application or package in monorepo has project files/folders organized and grouped by feature.
- Collocate code as close as possible to where it's relevant.
- Deep folder nesting should not represent an issue.

### Imports

Import paths can be relative, starting with ./ or ../, or they can be absolute @common/utils.

To make import statements more readable and easier to understand:

- Relative imports ./sortItems must be used when importing files within the same feature, that are 'close' to each other, which also allows moving feature around the codebase without introducing changes in these imports.
- Absolute imports @common/utils must be used in all other cases.
- All imports must be auto sorted by tooling e.g. prettier-plugin-sort-imports, eslint-plugin-import...

```ts
// ❌ Avoid
import { bar, foo } from '../../../../../../distant-folder';

// ✅ Use
import { locationApi } from '@api/locationApi';

import { foo } from '../../foo';
import { bar } from '../bar';
import { baz } from './baz';
```



## React

Since React components and hooks are also functions, respective function conventions applies.

### Required & Optional Props

**Strive to have majority of props required and use optional sparingly.**

Especially when creating new component for first/single use case majority of props should be required. When component starts covering more use cases, introduce optional props.
There are potential exceptions, where component API needs to implement optional props from the start (e.g. shared components covering multiple use cases, UI design system components - button `isDisabled` etc.)

If component/hook becomes to complex it probably should be broken into smaller pieces.
An exaggerated example where implementing 10 React components with 5 required props each, is better then implementing one "can do it all" component that accepts 50 optional props.

#### Props as Discriminated Type

When applicable use discriminated type to eliminate optional props, which will decrease complexity on component API and only necessary/required props will be passed depending on its use case.

```ts
// ❌ Avoid optional props as they increase complexity of component API
type StatusProps = {
  data?: Products;
  title?: string;
  time?: number;
  error?: string;
};

// ✅ Strive to have majority of props required, if that's not possible,
// use discriminated union for clear intent on component usage
type StatusSuccess = {
  status: 'success';
  data: Products;
  title: string;
};

type StatusLoading = {
  status: 'loading';
  time: number;
};

type StatusError = {
  status: 'error';
  error: string;
};

type StatusProps = StatusSuccess | StatusLoading | StatusError;

export const Status = (status: StatusProps) => {...
```

#### Props To State

In general avoid using props to state, since component will not update on prop changes. It can lead to bugs that are hard to track, with unintended side effects and difficulty testing.
When there is truly a use case for using prop in initial state, prop must be prefixed with initial (e.g. initialProduct, initialSort etc.)

```
// ❌ Avoid using props to state
type FooProps = {
  productName: string;
  userId: string;
};

export const Foo = ({ productName, userId }: FooProps) => {
  const [productName, setProductName] = useState(productName);
  ...

// ✅ Use prop prefix `initial`, when there is a rational use case for it
type FooProps = {
  initialProductName: string;
  userId: string;
};

export const Foo = ({ initialProductName, userId }: FooProps) => {
  const [productName, setProductName] = useState(initialProductName);
  ...
```

#### Props Type

```
// ❌ Avoid using React.FC type
type FooProps = {
  name: string;
  score: number;
};

export const Foo: React.FC<FooProps> = ({ name, score }) => {

// ✅ Use props argument with type
type FooProps = {
  name: string;
  score: number;
};

export const Foo = ({ name, score }: FooProps) => {...
```



### Component Types

#### Container

- All container components have postfix "Container" or "Page" `[ComponentName]Container|Page`. Use "Page" postfix to indicate component is an actual web page.

- Each feature has a container component (`AddUserContainer.tsx`, `EditProductContainer.tsx`, `ProductsPage.tsx` etc.)

- Includes business logic.

- API integration.

- Structure:

  ```text
  ProductsPage/
  ├─ api/
  │  └─ useGetProducts/
  ├─ components/
  │  └─ ProductItem/
  ├─ utils/
  │  └─ filterProductsByType/
  └─ index.tsx
  ```

#### UI - Feature

- Representational components that are designed to fulfill feature requirements.

- Nested inside container component folder.

- Should follow functions conventions as much as possible.

- No API integration.

- Structure:

  ```text
  ProductItem/
  ├─ index.tsx
  ├─ ProductItem.stories.tsx
  └─ ProductItem.test.tsx
  ```

#### UI - Design system

- Global Reusable/shared components used throughout whole codebase.

- Structure:

  ```text
  Button/
  ├─ index.tsx
  ├─ Button.stories.tsx
  └─ Button.test.tsx
  ```

#### Store and Pass Data

- Utilize storing state in the URL, especially for filtering, sorting etc.

- Don't sync URL state with local state.

- Consider passing data simply through props, using the URL, or composing children. Use global state (Zustand, Context) as a last resort.

- Use React compound components when components should belong and work together: `menu`, `accordion`,`navigation`, `tabs`, `list`,...
  Always export compound components as:

  ```tsx
  // PriceList.tsx
  const PriceListRoot = ({ children }) => <ul>{children}</ul>;
  const PriceListItem = ({ title, amount }) => <li>Name: {name} - Amount: {amount}<li/>;
  
  // ❌
  export const PriceList = {
    Container: PriceListRoot,
    Item: PriceListItem,
  };
  // ❌
  PriceList.Item = Item;
  export default PriceList;
  
  // ✅
  export const PriceList = PriceListRoot as typeof PriceListRoot & {
    Item: typeof PriceListItem;
  };
  PriceList.Item = PriceListItem;
  
  // App.tsx
  import { PriceList } from "./PriceList";
  
  <PriceList>
    <PriceList.Item title="Item 1" amount={8} />
    <PriceList.Item title="Item 2" amount={12} />
  </PriceList>;
  ```

  

- UI components should show derived state and send events, nothing more.

- As in many programming languages functions args can be passed to the next function and on to the next etc.
  React components are no different, where prop drilling should not become an issue.
  If with app scaling prop drilling truly becomes an issue, try to refactor render method, local states in parent components, using composition etc.

- Data fetching is only allowed in container components.

- Use of server-state library is encouraged ([react-query](https://github.com/tanstack/query), [apollo client](https://github.com/apollographql/apollo-client)...).

- Use of client-state library for global state is discouraged.
  Reconsider if something should be truly global across application, e.g. `themeMode`, `Permissions` or even that can be put in server-state (e.g. user settings - `/me` endpoint). If still global state is truly needed use [Zustand](https://github.com/pmndrs/zustand) or Context.