# help で表示するためコマンドの定義は以下のように記述
# {コマンド}: ## {コマンドの説明} ## {引数使用の場合のコマンドを記述}
help: ## print this message
	@echo ""
	@echo "Command list:"
	@printf "\033[36m%-35s\033[0m %s\n" "[Sub command]" "[Description]"
	@grep -E '^[/a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | perl -pe 's%^([/a-zA-Z_-]+):.*?(##)%$$1 $$2%' | awk -F " *?## *?" '{printf "\033[36m%-35s\033[0m %s\n", $$3 ? $$3 : $$1, $$2}'
	@echo ''

bootstrap: ## bootstrap ## bootstrap e=[environment]
ifeq "$(e)" "dev"
	$(eval env := develop)
	$(eval profile := e-playground-kohei)
else ifeq "$(e)" "stg"
	@echo "Not implemented yet $(e)"
	@exit 1
else ifeq "$(e)" "prod"
	@echo "Not implemented yet$(e)"
	@exit 1
else 
	@exit 1
endif
	cdk bootstrap \
		--profile $(profile) \
		--context environment=$(env) \
		--bootstrap-bucket-name aws-cdk-sample-sugar-ecs-state-$(env) \
		--qualifier $(env)

deploy: ## deploy ## deploy e=[environment]
ifeq "$(e)" "dev"
	$(eval env := develop)
	$(eval profile := e-playground-kohei)
else ifeq "$(e)" "stg"
	@echo "Not implemented yet$(e)"
	@exit 1
else ifeq "$(e)" "prod"
	@echo "Not implemented yet$(e)"
	@exit 1
else 
	@exit 1
endif
	cdk deploy \
		--profile $(profile) \
		--context environment=$(env) \
		--bootstrap-bucket-name aws-cdk-sample-sugar-ecs-state-$(env) \
		--qualifier $(env)

destroy: ## destroy ## destroy e=[environment]
ifeq "$(e)" "dev"
	$(eval env := develop)
	$(eval profile := e-playground-kohei)
else ifeq "$(e)" "stg"
	@echo "Not implemented yet$(e)"
	@exit 1
else ifeq "$(e)" "prod"
	@echo "Not implemented yet$(e)"
	@exit 1
else 
	@exit 1
endif
	cdk destroy \
		--profile $(profile) \
		--context environment=$(env) \
		--bootstrap-bucket-name aws-cdk-sample-sugar-ecs-state-$(env) \
		--qualifier $(env)

list: ## list stacks
	cdk list

synth: ## synth name={stack name}
	cdk synth $(name)