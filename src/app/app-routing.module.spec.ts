import { routes } from './app-routing.module';

describe('app routes', () => {
  it('reads the project past the HTTP cache on the edit route', () => {
    const edit = routes.find(route => route.path === 'p/:projId')?.children?.find(route => route.path === 'edit');

    expect(edit?.data?.['freshRead']).toBeTrue();
  });
});
