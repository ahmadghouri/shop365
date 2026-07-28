# Requirements Document

## Introduction

The Welcome/Registration Screen is the first screen users see when opening the Shop365 mobile app. It serves as the entry point and onboarding experience, presenting brand identity through an illustration, welcome messaging, and a clear call-to-action to register. The screen is built using reusable components on a React Native + Expo stack with NativeWind styling, and establishes the navigation foundation for future screens.

## Glossary

- **Welcome_Screen**: The initial landing screen displayed when the app launches, containing brand imagery, welcome text, and a registration call-to-action button
- **Navigation_Stack**: The native-stack navigator from @react-navigation/native-stack that manages screen transitions in the app
- **Brand_Color**: The golden/yellow accent color (approximately HSL 43 96% 56%) used for the Shop365 brand identity and primary interactive elements
- **Illustration_Component**: A reusable React Native Image component that renders the onboarding illustration at the top of the Welcome_Screen
- **Text_Component**: The existing reusable Text component from the UI library supporting variants (h1, h2, p, muted, etc.)
- **Screen_Container**: A reusable layout wrapper component that provides safe-area handling, consistent padding, and background color for any screen

## Requirements

### Requirement 1: Welcome Screen as Initial Route

**User Story:** As a new user, I want the welcome screen to appear first when I open the app, so that I understand what the app is about before proceeding.

#### Acceptance Criteria

1. WHEN the app launches, THE Navigation_Stack SHALL render the Welcome_Screen as the initial route with no other screen displayed before it
2. WHILE the Welcome_Screen is displayed, THE Navigation_Stack SHALL hide the header bar by setting headerShown to false for that screen
3. THE Welcome_Screen SHALL occupy the full available safe-area with a white (#FFFFFF) background color extending edge-to-edge behind the system bars
4. WHILE the Welcome_Screen is displayed, THE status bar SHALL remain visible with dark content style to ensure readability against the white background

### Requirement 2: Navigation Stack Configuration

**User Story:** As a developer, I want a properly configured navigation stack, so that I can add future screens (login, home, etc.) without restructuring the app.

#### Acceptance Criteria

1. THE Navigation_Stack SHALL be configured using @react-navigation/native-stack with a exported TypeScript type `RootStackParamList` that maps each route name to its param type (or `undefined` if the route accepts no params)
2. THE Navigation_Stack SHALL define route entries for Welcome, Register, Login, and Home screens, where each route param type is `undefined` unless the screen requires navigation parameters
3. WHEN the Navigation_Stack initializes, THE Navigation_Stack SHALL set "Welcome" as the `initialRouteName`
4. THE Navigation_Stack SHALL wrap the app content inside NavigationContainer and SafeAreaProvider, with SafeAreaProvider as the outermost wrapper
5. THE Navigation_Stack SHALL configure `headerShown: false` as the default screen option for all screens in the stack navigator
6. IF a screen component referenced in the Navigation_Stack is not yet implemented, THEN THE Navigation_Stack SHALL render a placeholder component that displays the route name as text, so the app compiles and navigates without error

### Requirement 3: Onboarding Illustration Display

**User Story:** As a new user, I want to see an appealing illustration on the welcome screen, so that the app feels professional and welcoming.

#### Acceptance Criteria

1. THE Illustration_Component SHALL render an image from a local asset file at the top section of the Welcome_Screen using "contain" resize mode to prevent cropping or distortion
2. THE Illustration_Component SHALL maintain the image aspect ratio on all screen sizes without stretching or cropping the image content
3. THE Illustration_Component SHALL scale proportionally to occupy between 35% and 50% of the screen height, adapting within this range based on available vertical space
4. THE Illustration_Component SHALL accept a source prop (React Native ImageSourcePropType) and an accessibilityLabel string prop, making the component reusable for other onboarding screens
5. IF the image asset fails to load, THEN THE Illustration_Component SHALL render the allocated space without displaying a broken image indicator, preserving the surrounding layout

### Requirement 4: Welcome Title with Brand Highlight

**User Story:** As a new user, I want to see a welcome message with the brand name highlighted, so that I immediately recognize the app identity.

#### Acceptance Criteria

1. THE Text_Component SHALL display "Welcome to our" followed by "Shop365 App" as the screen title, rendered using a large bold font style consistent with the h1 variant
2. WITHIN the title text, THE Text_Component SHALL render the word "Shop365" in Brand_Color (golden/yellow) while the remaining words ("Welcome to our" and "App") SHALL render in the default foreground color
3. THE Text_Component SHALL center-align the title text horizontally within the screen width
4. THE title text SHALL be positioned below the Illustration_Component with vertical spacing of at least 16px between the illustration bottom edge and the title top edge

### Requirement 5: Powered By Subtitle

**User Story:** As a new user, I want to see the technology partner attribution, so that I know who powers the app.

#### Acceptance Criteria

1. THE Text_Component SHALL display "Powered by NBT-HUB" immediately below the welcome title using the muted variant
2. THE Text_Component SHALL center-align the subtitle text horizontally
3. THE Text_Component SHALL render the subtitle with a smaller font size and muted foreground color as defined by the muted variant, providing reduced visual emphasis compared to the title

### Requirement 6: Brand Color Theme Integration

**User Story:** As a developer, I want a centralized brand color definition, so that I can consistently apply the Shop365 gold/yellow theme across the app.

#### Acceptance Criteria

1. THE global CSS configuration SHALL define a brand color CSS variable (--brand) with the HSL value `43 96% 56%` in the :root selector
2. THE global CSS configuration SHALL define a brand foreground CSS variable (--brand-foreground) with white (`0 0% 100%`) for text rendered on top of brand-colored backgrounds
3. THE tailwind.config.js SHALL expose the brand color as Tailwind utility classes (text-brand, bg-brand, border-brand) and a foreground variant (text-brand-foreground, bg-brand-foreground)
4. THE Brand_Color SHALL follow the same HSL CSS variable pattern used by existing theme colors (primary, secondary, destructive, etc.)

### Requirement 7: Responsive Layout

**User Story:** As a user on any device, I want the welcome screen to look correct on different screen sizes, so that the experience is consistent.

#### Acceptance Criteria

1. THE Screen_Container SHALL use flexbox column layout to distribute content vertically
2. THE Welcome_Screen SHALL position the Illustration_Component in the upper section occupying 40-50% of the available screen height, and the text content in the lower section occupying the remaining space
3. WHILE the device screen height is below 700 density-independent pixels, THE Illustration_Component SHALL reduce its proportional height to no more than 35% of the screen height so that all content (title and subtitle) remains visible without scrolling
4. THE Welcome_Screen SHALL apply safe-area insets to avoid content being obscured by device notches or system bars
5. THE Welcome_Screen SHALL display the illustration, title, and subtitle fully visible within the viewport on all supported screen sizes without requiring scrolling

### Requirement 8: Reusable Screen Container Component

**User Story:** As a developer, I want a reusable screen layout component, so that future screens share consistent padding, safe-area handling, and background color.

#### Acceptance Criteria

1. THE Screen_Container SHALL wrap child content with SafeAreaView from react-native-safe-area-context, apply 16px horizontal padding, and expand to fill the available screen height using flex
2. THE Screen_Container SHALL accept an optional className prop that merges with (rather than replaces) the default container styles, allowing per-screen style customization
3. IF no className prop is provided, THEN THE Screen_Container SHALL render with the app's white background color as defined in the theme configuration
4. THE Screen_Container SHALL accept a children prop and render all provided child components within the safe-area-padded container
5. THE Screen_Container SHALL be exported as a named export from the components directory following the same pattern as existing reusable components (Button, Text)
