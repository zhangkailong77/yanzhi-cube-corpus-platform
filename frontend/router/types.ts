export type AppRoute = '/' | '/search' | '/preview/:id' | '/dashboard' | '/unauthorized' | '/login';

export interface NavigationState {
  from?: string;
}
