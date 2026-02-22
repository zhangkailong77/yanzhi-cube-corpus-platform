/**
 * Navigation Utilities
 * Provides convenient, type-safe navigation helpers
 */
import { useNavigate, useLocation, type NavigateFunction } from 'react-router-dom';
import type { AppRoute, NavigationState } from './types';

export function useAppNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = (
    route: AppRoute,
    params?: Record<string, string | number>,
    options?: {
      state?: NavigationState;
      replace?: boolean;
    }
  ) => {
    let path = route;

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        path = path.replace(`:${key}`, String(value));
      });
    }

    navigate(path, options);
  };

  const navigateWithReturn = (
    to: string,
    state?: NavigationState
  ) => {
    navigate(to, {
      state: {
        ...state,
        from: location.pathname + location.search,
      },
    });
  };

  const goBack = () => {
    navigate(-1);
  };

  return {
    navigateTo,
    navigateWithReturn,
    goBack,
    currentPath: location.pathname,
    currentSearch: location.search,
    state: location.state as NavigationState | undefined,
  };
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}

export function parseQueryString(search: string) {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}
