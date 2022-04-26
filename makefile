
# ifndef mablung-makefile-environment-path
# export mablung-makefile-environment-path := $(shell npx mablung-makefile-environment get-path)
# endif

# include $(mablung-makefile-environment-path)

include node_modules/@virtualpatterns/mablung-makefile-environment/makefile
